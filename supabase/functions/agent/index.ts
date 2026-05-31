import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

const SYSTEM_PROMPT = `Ti si klinički asistent za stomatološku ordinaciju.
Uvek komuniciraj na srpskom jeziku. Budi koncizan — doktori nemaju vremena za dugačke odgovore.
Nikada ne govori da si nešto uradio bez da si stvarno pozvao odgovarajući tool.
Ako tool vrati grešku, odmah je prijavi korisniku — nemoj govoriti da je uspelo ako nije.

=== TIPOVI PODATAKA ===
• Klinička napomena → create_clinical_note: šta je urađeno tokom posete (nalaz, procedura, preporuka)
• Medicinski karton → update_medical_record: trajni podaci (alergije, upozorenja, hronične bolesti, terapija)
  Ako doktor pomene alergiju ili medicinsko upozorenje — UVEK update_medical_record, NIKADA create_clinical_note.

=== WORKFLOW DOLASKA PACIJENTA ===
Korak 1: mark_patient_arrived(appointment_id)
Korak 2: start_visit(patient_id, appointment_id)  ← appointment_id je obavezan, bez njega termin ostaje otvoren
Oba koraka pozovi odmah, bez čekanja na potvrdu.

=== WORKFLOW DIKTIRANJA I ZATVARANJA POSETE ===
Korak 1: Pronađi visit_id — iz start_visit rezultata ili get_active_visits
Korak 2: propose_clinical_note(patient_id, visit_id, raw_text, note_date) — NE UPISUJE, samo formatira
Korak 3: Prikaži predlog sa tekstom "CONFIRM_REQUIRED" i ČEKAJ na potvrdu
Korak 4: Kada korisnik kaže "potvrdi", "da", "upiši" ili pritisne dugme:
  4a. Pozovi create_clinical_note(patient_id, visit_id, content)
  4b. Odmah zatim pozovi complete_visit(visit_id, next_step, recommendation)
  NIKADA ne odgovaraj tekstom "upisano" pre nego što su oba tool-a uspešno izvršena.

=== VREDNOSTI ZA next_step ===
• 'no_follow_up' — nema potrebe za kontrolom
• 'follow_up_recommended' — preporučena kontrola
• 'schedule_control_visit' — zakaži kontrolni pregled
• 'continue_treatment_plan' — nastavak plana terapije
• 'additional_diagnostics' — dodatna dijagnostika
• 'referral' — uput

=== VAŽNO ===
Ako se ne zna visit_id, pozovi get_active_visits pre bilo kojeg pisanja.
Ako update_medical_record vrati grešku, javi grešku korisniku — ne nastavljaj.
complete_visit UVEK dolazi posle create_clinical_note, nikada pre.`;

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
  },
  {
    name: "get_active_visits",
    description: "Vraća posete koje su trenutno u toku (in_progress) za kliniku",
    input_schema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "mark_patient_arrived",
    description: "Označava pacijenta kao stiglog i ažurira operational_state termina na 'arrived'. Poziva se kada doktor ili recepcija potvrdi dolazak pacijenta.",
    input_schema: {
      type: "object",
      properties: {
        appointment_id: { type: "string", description: "ID zakazanog termina" }
      },
      required: ["appointment_id"]
    }
  },
  {
    name: "propose_clinical_note",
    description: "Strukturira diktirani tekst u kliničku napomenu i vraća predlog za potvrdu. NE upisuje u bazu — samo formatira predlog.",
    input_schema: {
      type: "object",
      properties: {
        patient_id: { type: "string", description: "ID pacijenta" },
        visit_id: { type: "string", description: "ID posete" },
        raw_text: { type: "string", description: "Sirovi diktirani tekst doktora" },
        note_date: { type: "string", description: "Datum napomene u formatu YYYY-MM-DD" }
      },
      required: ["patient_id", "raw_text", "note_date"]
    }
  },
  {
    name: "start_visit",
    description: "Kreira novu posetu u statusu in_progress za pacijenta. Koristi kada ne postoji otvorena poseta. Uvek prosleđuj appointment_id ako pacijent ima zakazan termin.",
    input_schema: {
      type: "object",
      properties: {
        patient_id: { type: "string", description: "ID pacijenta" },
        appointment_id: { type: "string", description: "ID termina — obavezno ako postoji zakazan termin za danas" }
      },
      required: ["patient_id"]
    }
  },
  {
    name: "update_medical_record",
    description: "Ažurira medicinski karton pacijenta — alergije, upozorenja, anamneza. Koristi ISKLJUČIVO za dugotrajne medicinske podatke koje svi doktori moraju da vide. NE koristi za kliničke napomene iz poseta.",
    input_schema: {
      type: "object",
      properties: {
        patient_id: { type: "string" },
        allergies: { type: "string", description: "Tekst alergija — prepisuje prethodni unos" },
        medical_warnings: { type: "string", description: "Medicinska upozorenja" },
        anamnesis_summary: { type: "string", description: "Anamneza" },
        current_medications: { type: "string", description: "Trenutna terapija" }
      },
      required: ["patient_id"]
    }
  },
  {
    name: "create_clinical_note",
    description: "Kreira kliničku napomenu u bazi SAMO nakon eksplicitne potvrde korisnika. Linkuje napomenu sa posetom ako je visit_id prosleđen.",
    input_schema: {
      type: "object",
      properties: {
        patient_id: { type: "string" },
        visit_id: { type: "string", description: "ID posete — obavezno ako postoji otvorena poseta" },
        content: { type: "string", description: "Finalni tekst napomene" }
      },
      required: ["patient_id", "content"]
    }
  },
  {
    name: "complete_visit",
    description: "Zatvara posetu i postavlja status na completed. Poziva se nakon što je klinička napomena upisana. Uvek postavi next_step.",
    input_schema: {
      type: "object",
      properties: {
        visit_id: { type: "string", description: "ID posete koju treba zatvoriti" },
        next_step: {
          type: "string",
          description: "Sledeći korak: 'no_follow_up' | 'follow_up_recommended' | 'schedule_control_visit' | 'continue_treatment_plan' | 'additional_diagnostics' | 'referral'"
        },
        recommendation: { type: "string", description: "Preporuka doktora — slobodan tekst" }
      },
      required: ["visit_id", "next_step"]
    }
  }
];

// deno-lint-ignore no-explicit-any
async function executeTool(
  name: string,
  input: Record<string, string>,
  supabase: any
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

    case "get_active_visits": {
      const { data } = await supabase
        .from("visits")
        .select(`
          id, visit_date, status, recommendation, next_step,
          patient:patients(id, first_name, last_name),
          completed_by:profiles!visits_completed_by_fkey(full_name)
        `)
        .eq("clinic_id", input.clinic_id)
        .eq("status", "in_progress")
        .order("visit_date", { ascending: false })
        .limit(10);
      return data ?? [];
    }

    case "propose_clinical_note": {
      const today = new Date().toISOString().split("T")[0];
      return {
        proposal: true,
        patient_id: input.patient_id,
        visit_id: input.visit_id ?? null,
        note_date: input.note_date ?? today,
        content: input.raw_text,
        action: "CONFIRM_REQUIRED"
      };
    }

    case "start_visit": {
      const { data, error } = await supabase
        .from("visits")
        .insert({
          clinic_id: input.clinic_id,
          patient_id: input.patient_id,
          appointment_id: input.appointment_id || null,
          status: "in_progress",
          visit_date: new Date().toISOString().slice(0, 10),
          started_at: new Date().toISOString(),
          created_by: input.profile_id || null,
          updated_by: input.profile_id || null
        })
        .select("id, status, visit_date")
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, visit_id: data.id, visit_date: data.visit_date };
    }

    case "update_medical_record": {
      const updates: Record<string, string | null> = {};
      if (input.allergies !== undefined) updates.allergies = input.allergies;
      if (input.medical_warnings !== undefined) updates.medical_warnings = input.medical_warnings;
      if (input.anamnesis_summary !== undefined) updates.anamnesis_summary = input.anamnesis_summary;
      if (input.current_medications !== undefined) updates.current_medications = input.current_medications;

      const { error } = await supabase
        .from("patient_medical_records")
        .upsert(
          {
            patient_id: input.patient_id,
            clinic_id: input.clinic_id,
            ...updates,
            created_by: input.profile_id || null,
            updated_by: input.profile_id || null
          },
          { onConflict: "patient_id" }
        );
      if (error) return { success: false, error: error.message };
      return { success: true, updated_fields: Object.keys(updates) };
    }

    case "create_clinical_note": {
      const { data, error } = await supabase
        .from("clinical_notes")
        .insert({
          patient_id: input.patient_id,
          clinic_id: input.clinic_id,
          visit_id: input.visit_id || null,
          note_type: "general",
          content: input.content,
          created_by: input.profile_id || null,
          updated_by: input.profile_id || null
        })
        .select("id")
        .single();
      if (error) return { success: false, error: error.message };

      // Linkuj clinical_note_id na posetu
      if (input.visit_id && data?.id) {
        await supabase
          .from("visits")
          .update({ clinical_note_id: data.id, updated_by: input.profile_id || null })
          .eq("id", input.visit_id)
          .eq("clinic_id", input.clinic_id);
      }

      return { success: true, note_id: data.id };
    }

    case "mark_patient_arrived": {
      const { error } = await supabase
        .from("appointments")
        .update({
          operational_state: "arrived",
          updated_by: input.profile_id || null
        })
        .eq("id", input.appointment_id)
        .eq("clinic_id", input.clinic_id);
      if (error) return { success: false, error: error.message };
      return { success: true, appointment_id: input.appointment_id, operational_state: "arrived" };
    }

    case "complete_visit": {
      const now = new Date().toISOString();
      const validNextSteps = new Set(["no_follow_up", "follow_up_recommended", "schedule_control_visit", "continue_treatment_plan", "additional_diagnostics", "referral"]);
      const nextStep = validNextSteps.has(input.next_step) ? input.next_step : "no_follow_up";

      const { data, error } = await supabase
        .from("visits")
        .update({
          status: "completed",
          completed_at: now,
          completed_by: input.profile_id || null,
          updated_by: input.profile_id || null,
          next_step: nextStep,
          recommendation: input.recommendation || null
        })
        .eq("id", input.visit_id)
        .eq("clinic_id", input.clinic_id)
        .is("deleted_at", null)
        .select("id, status, completed_at, appointment_id")
        .single();
      if (error) return { success: false, error: error.message };

      // Zatvori i linked appointment
      if (data?.appointment_id) {
        await supabase
          .from("appointments")
          .update({ status: "completed", updated_by: input.profile_id || null })
          .eq("id", data.appointment_id)
          .eq("clinic_id", input.clinic_id);
      }

      return { success: true, visit_id: data.id, completed_at: data.completed_at };
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

  const { messages, clinic_id, profile_id } = await req.json();

  // Agentic loop — agent može pozvati više alata pre finalnog odgovora
  const agentMessages = [...messages];
  let response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools,
    messages: agentMessages
  });

  let proposal: Record<string, unknown> | null = null;

  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(b => b.type === "tool_use");
    const toolResults: Anthropic.MessageParam = {
      role: "user",
      content: await Promise.all(
        toolUseBlocks.map(async (block) => {
          if (block.type !== "tool_use") return null!;
          const result = await executeTool(
            block.name,
            { ...block.input as Record<string, string>, clinic_id, profile_id },
            supabase
          );
          if (block.name === "propose_clinical_note") {
            proposal = result as Record<string, unknown>;
          }
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
  return new Response(JSON.stringify({ reply: text, proposal }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
});
