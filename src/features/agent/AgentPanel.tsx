import { useState, useRef, useEffect } from "react";
import { useAgent } from "./useAgent";
import { useCurrentProfile } from "../auth/useCurrentProfile";

type PendingNote = {
  patientId: string;
  visitId: string | null;
  noteDate: string;
  content: string;
};

const QUICK_PROMPTS = [
  "Ko dolazi danas?",
  "Pripremi jutarnji briefing",
  "Ima li upozorenja za današnje pacijente?",
];

export function AgentPanel() {
  const { profile } = useCurrentProfile();
  const clinicId = profile?.clinicId ?? "";
  const profileId = profile?.id ?? "";
  const { messages, isLoading, error, send, clear, proposal } = useAgent(clinicId, profileId);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [pendingNote, setPendingNote] = useState<PendingNote | null>(null);
  const [dataChanged, setDataChanged] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setDataChanged(true);
    window.addEventListener("agent:data-changed", handler);
    return () => window.removeEventListener("agent:data-changed", handler);
  }, []);

  useEffect(() => {
    if (proposal) {
      setPendingNote({
        patientId: proposal.patient_id,
        visitId: proposal.visit_id,
        noteDate: proposal.note_date,
        content: proposal.content,
      });
    }
  }, [proposal]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading || !clinicId) return;
    send(input.trim());
    setInput("");
  };

  const handleQuickPrompt = (q: string) => {
    if (!clinicId) return;
    send(q);
  };

  if (!profile) return null;

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                   bg-purple-50 text-purple-700 text-sm font-medium
                   hover:bg-purple-100 transition-colors"
      >
        <span className="text-base">✦</span>
        Asistent
      </button>

      {open && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white
                        border-l border-gray-200 flex flex-col z-50 shadow-lg">
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Klinički asistent</p>
              <p className="text-xs text-gray-400">
                {profile.fullName} · {profile.role}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clear}
                className="text-xs text-gray-400 hover:text-gray-600">
                Obriši
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none">
                ×
              </button>
            </div>
          </div>

          {dataChanged && (
            <button
              onClick={() => window.location.reload()}
              className="w-full px-3 py-2 bg-amber-50 text-amber-700 text-xs font-medium
                         border-b border-amber-200 hover:bg-amber-100 transition-colors text-left">
              ↻ Podaci su ažurirani — klikni da osvežiš stranicu
            </button>
          )}

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-xs text-gray-400 mb-1">Brze akcije:</p>
                {QUICK_PROMPTS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleQuickPrompt(q)}
                    className="text-left text-sm px-3 py-2 rounded-lg
                               bg-gray-50 hover:bg-gray-100 text-gray-700
                               transition-colors border border-gray-100">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm leading-relaxed px-3 py-2 rounded-lg
                  ${m.role === "user"
                    ? "bg-purple-50 text-purple-900 ml-4"
                    : "bg-gray-50 text-gray-800 mr-4"}`}>
                <span dangerouslySetInnerHTML={{
                  __html: m.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/### (.*?)(\n|$)/g, '<strong style="font-size:13px">$1</strong><br/>')
                    .replace(/\n/g, '<br/>')
                }} />
                {m.role === "assistant" && m.content.includes("CONFIRM_REQUIRED") && pendingNote && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        send(`Potvrdi — upiši napomenu za pacijenta ${pendingNote.patientId}`);
                        setPendingNote(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700">
                      ✓ Potvrdi i upiši
                    </button>
                    <button
                      onClick={() => setPendingNote(null)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs hover:bg-gray-50">
                      Otkaži
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="bg-gray-50 text-gray-400 text-sm
                              px-3 py-2 rounded-lg mr-4 animate-pulse">
                Razmišljam…
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Pitaj nešto…"
                className="flex-1 text-sm px-3 py-2 rounded-lg border
                           border-gray-200 outline-none focus:border-purple-300
                           bg-gray-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim() || !clinicId}
                className="px-3 py-2 rounded-lg bg-purple-600 text-white
                           text-sm font-medium hover:bg-purple-700
                           disabled:opacity-40 transition-colors">
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}