import { supabase } from "@/lib/supabaseClient";

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendAgentMessage(
  messages: AgentMessage[],
  clinicId: string
): Promise<string> {
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
      body: JSON.stringify({ messages, clinic_id: clinicId })
    }
  );

  if (!res.ok) throw new Error("Agent nije dostupan");
  const data = await res.json();
  return data.reply;
}
