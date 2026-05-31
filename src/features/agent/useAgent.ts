import { useState, useCallback } from "react";
import { sendAgentMessage, type AgentMessage, type ProposalData } from "./agentService";

export function useAgent(clinicId: string, profileId: string) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ProposalData | null>(null);

  const send = useCallback(async (text: string) => {
    const userMsg: AgentMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setIsLoading(true);
    setError(null);

    try {
      const { reply, proposal: newProposal } = await sendAgentMessage(next, clinicId, profileId);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      setProposal(newProposal);
      if (newProposal === null && reply) {
        window.dispatchEvent(new CustomEvent("agent:data-changed"));
      }
    } catch {
      setError("Agent trenutno nije dostupan.");
    } finally {
      setIsLoading(false);
    }
  }, [messages, clinicId]);

  const clear = useCallback(() => {
    setMessages([]);
    setProposal(null);
  }, []);

  return { messages, isLoading, error, send, clear, proposal };
}
