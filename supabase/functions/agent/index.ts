import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

const SYSTEM_PROMPT = `Ti si klinički asistent za stomatološku ordinaciju.
Imaš pristup podacima o pacijentima, terminima i kliničkim napomenama.
Uvek komuniciraj na srpskom jeziku, koristeći stručnu stomatološku terminologiju.
Budi koncizan i praktičan — doktori i recepcija nemaju vremena za dugačke odgovore.
Nikada ne menjaj podatke bez eksplicitne potvrde korisnika.
Ako nešto nisi siguran, reci to jasno umesto da nagađaš.`;

const tools: Anthropic.Tool[] = [
  {
    name: "get_today_appointments",
    description: "Vraća listu termina za danas u ordinaciji",
    input_schema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_patient_summary",
    description: "Vraća sažetak pacijenta: poslednja poseta, aktivni plan terapije, alergije, napomene",
    input_schema: {
      type: "object",
      properties: {
        patient_id: { type: "string" }
      },
      required: ["patient_id"]
    }
  },
  {
    name: "search_patients",
    description: "Pretražuje pacijente po imenu, prezimenu ili broju telefona",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" }
      },
      required: ["query"]
    }
  },
  {
    name: "get_treatment_plan_status",
    description: "Vraća status aktivnog plana terapije za pacijenta — šta je urađeno, šta ostaje",
    input_schema: {
      type: "object",
      properties: {
        patient_id: { type: "string" }
      },
      required: ["patient_id"]
    }
  }
];

async function executeTool(
  name: string,
  input: Record<string, string>,
  supabase: ReturnType<typeof createClient>
) {
  switch (name) {
    case "get_today_appointments": {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id, scheduled_start, scheduled_end, status, operational_state, notes,
          patient:patients(id, first_name, last_name, phone),
          provider:profiles!appointments_assigned_provider_id_fkey(full_name)
        `)
        .eq("clinic_id", input.clinic_id)
        .gte("scheduled_start", todayStart.toISOString())
        .lt("scheduled_start", todayEnd.toISOString())
        .order("scheduled_start");

return data ?? [];
    }

    case "get_patient_summary": {
      const [patientRes, recordRes, visitsRes, plansRes] = await Promise.all([
        supabase.from("patients")
          .select("*")
          .eq("id", input.patient_id)
          .eq("clinic_id", input.clinic_id)
          .single(),
        supabase.from("patient_medical_records")
          .select("allergies, medical_warnings, current_medications, anamnesis_summary")
          .eq("patient_id", input.patient_id)
          .single(),
        supabase.from("visits")
          .select("id, visit_date, recommendation, next_step")
          .eq("patient_id", input.patient_id)
          .eq("clinic_id", input.clinic_id)
          .order("visit_date", { ascending: false })
          .limit(3),
        supabase.from("treatment_plans")
          .select("id, title, status, treatment_plan_items(*)")
          .eq("patient_id", input.patient_id)
          .eq("clinic_id", input.clinic_id)
          .eq("status", "in_progress")
          .limit(1)
      ]);
      return {
        patient: patientRes.data,
        medical_record: recordRes.data,
        recent_visits: visitsRes.data,
        active_plan: plansRes.data?.[0] ?? null
      };
    }

    case "search_patients": {
      const terms = input.query.trim().split(/\s+/);
      let query = supabase
        .from("patients")
        .select("id, first_name, last_name, phone, date_of_birth")
        .eq("clinic_id", input.clinic_id)
        .is("deleted_at", null);

      if (terms.length >= 2) {
        const a = `%${terms[0]}%`;
        const b = `%${terms.slice(1).join(" ")}%`;
        query = query.or(
          `and(first_name.ilike.${a},last_name.ilike.${b}),and(first_name.ilike.${b},last_name.ilike.${a})`
        );
      } else {
        const q = `%${input.query}%`;
        query = query.or(`first_name.ilike.${q},last_name.ilike.${q},phone.ilike.${q}`);
      }

      const { data } = await query.limit(5);
      return data ?? [];
    }

    case "get_treatment_plan_status": {
      const { data } = await supabase
        .from("treatment_plans")
        .select("title, status, treatment_plan_items(id, title, description, status, tooth_number, sort_order)")
        .eq("patient_id", input.patient_id)
        .eq("clinic_id", input.clinic_id)
        .order("created_at", { ascending: false })
        .limit(1);
      return data?.[0] ?? null;
    }

    default:
      return { error: "Nepoznat alat" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type"
      }
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Unauthorized", { status: 401 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { messages, clinic_id } = await req.json();

  // Agentic loop — agent može pozvati više alata pre finalnog odgovora
  const agentMessages = [...messages];
  let response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools,
    messages: agentMessages
  });

  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(b => b.type === "tool_use");
    const toolResults: Anthropic.MessageParam = {
      role: "user",
      content: await Promise.all(
        toolUseBlocks.map(async (block) => {
          if (block.type !== "tool_use") return null!;
          const result = await executeTool(
            block.name,
            { ...block.input as Record<string, string>, clinic_id },
            supabase
          );
          return {
            type: "tool_result" as const,
            tool_use_id: block.id,
            content: JSON.stringify(result)
          };
        })
      )
    };

    agentMessages.push({ role: "assistant", content: response.content });
    agentMessages.push(toolResults);

    response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages: agentMessages
    });
  }

  const text = response.content.find(b => b.type === "text")?.text ?? "";
  return new Response(JSON.stringify({ reply: text }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
});
