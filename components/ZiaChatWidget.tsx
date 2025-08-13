"use client";
import React, { useMemo, useRef, useState } from "react";
import { ziaChat, runQuickAction, mapPhraseToAction } from "@/lib/actions";
import { createVoiceController } from "@/utils/voice";

const VOICE_ENABLED = process.env.NEXT_PUBLIC_ZIA_VOICE_ENABLED === "true";
const BEDSIDE_MODE = process.env.NEXT_PUBLIC_ZIA_BEDSIDE_MODE === "true";

type Msg = { sender: "user" | "zia"; text: string };

export default function ZiaChatWidget() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const voice = useMemo(() =>
    createVoiceController({
      onStart: () => setListening(true),
      onEnd: () => setListening(false),
      onResult: (t) => handleSubmit(t),
      onError: () => setListening(false),
    }),
  []);

  async function handleSubmit(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput("");
    setMessages((m) => [...m, { sender: "user", text: content }]);
    setBusy(true);

    // Phrase -> quick action mapping first
    const actionReq = mapPhraseToAction(content);
    try {
      if (actionReq) {
        const r = await runQuickAction<any>(actionReq);
        if (!r.ok) throw new Error(r.json && (r.json as any).error?.message || `HTTP ${r.status}`);
        setMessages((m) => [...m, { sender: "zia", text: "Done." }]);
      } else {
        const r = await ziaChat<{ response?: string }>(content);
        const reply = (r.json as any)?.response || (r.ok ? "" : (r.json as any)?.error?.message || "Error");
        setMessages((m) => [...m, { sender: "zia", text: reply }]);
      }
    } catch (e: any) {
      setMessages((m) => [...m, { sender: "zia", text: `Error: ${e?.message || e}` }]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  const containerClasses = [
    "fixed z-[60] bottom-6 right-6 shadow-xl",
    BEDSIDE_MODE ? "max-w-[92vw] w-[92vw] sm:w-[420px]" : "w-[380px]",
  ].join(" ");
  const panelClasses = [
    "rounded-2xl border bg-white/95 backdrop-blur p-4 flex flex-col gap-3",
    BEDSIDE_MODE ? "text-lg" : "",
  ].join(" ");

  return (
    <div className={containerClasses}>
      <div className={panelClasses}>
        <div className="font-semibold flex items-center justify-between">
          <span>ZIA Assistant</span>
          {VOICE_ENABLED && (
            <button
              className={`px-3 py-1 rounded text-sm border ${listening ? "bg-red-600 text-white" : "bg-gray-100"}`}
              onClick={() => (listening ? voice.stop() : voice.start())}
              disabled={!voice.supported}
              title={voice.supported ? "Toggle voice" : "Voice unsupported"}
            >
              {listening ? "Stop" : "Voice"}
            </button>
          )}
        </div>

        <div className="h-64 overflow-y-auto space-y-2 pr-1">
          {messages.map((m, i) => (
            <div key={i} className={m.sender === "user" ? "text-right" : "text-left"}>
              <div className={`inline-block rounded-2xl px-3 py-2 ${m.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {busy && <div className="text-left text-gray-500 text-sm">ZIA is typing…</div>}
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder="Ask ZIA or say a command…"
            className={`flex-1 border rounded-lg px-3 py-2 ${BEDSIDE_MODE ? "text-lg" : "text-sm"}`}
          />
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            onClick={() => handleSubmit()}
            disabled={busy}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
