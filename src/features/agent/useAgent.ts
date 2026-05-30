import { useState, useCallback } from "react";
import { sendAgentMessage, type AgentMessage } from "./agentService";

export function useAgent(clinicId: string) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (text: string) => {
    const userMsg: AgentMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setIsLoading(true);
    setError(null);

    try {
      const reply = await sendAgentMessage(next, clinicId);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setError("Agent trenutno nije dostupan.");
    } finally {
      setIsLoading(false);
    }
  }, [messages, clinicId]);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, isLoading, error, send, clear };
}
