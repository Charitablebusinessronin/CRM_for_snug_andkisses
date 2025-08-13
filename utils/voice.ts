export type VoiceCallbacks = {
  onResult?: (text: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
};

export type VoiceController = {
  start: () => void;
  stop: () => void;
  supported: boolean;
};

export function createVoiceController(cb: VoiceCallbacks = {}): VoiceController {
  const SpeechRecognition: any =
    (typeof window !== "undefined" && (window as any).SpeechRecognition) ||
    (typeof window !== "undefined" && (window as any).webkitSpeechRecognition);

  if (!SpeechRecognition) {
    return {
      start: () => cb.onError?.(new Error("SpeechRecognition not supported")),
      stop: () => {},
      supported: false,
    };
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    try {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) cb.onResult?.(transcript);
    } catch (e) {
      cb.onError?.(e);
    }
  };
  recognition.onstart = () => cb.onStart?.();
  recognition.onend = () => cb.onEnd?.();
  recognition.onerror = (e: any) => cb.onError?.(e);

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    supported: true,
  };
}
