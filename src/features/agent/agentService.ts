import { supabase } from "@/lib/supabaseClient";

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ProposalData {
  patient_id: string;
  visit_id: string | null;
  note_date: string;
  content: string;
}

export interface AgentResponse {
  reply: string;
  proposal: ProposalData | null;
}

export async function sendAgentMessage(
  messages: AgentMessage[],
  clinicId: string,
  profileId: string
): Promise<AgentResponse> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) throw new Error("Nije prijavljen");

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ messages, clinic_id: clinicId, profile_id: profileId })
    }
  );

  if (!res.ok) throw new Error("Agent nije dostupan");
  const data = await res.json();
  return { reply: data.reply, proposal: data.proposal ?? null };
}
