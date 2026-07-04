"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type RecorderStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "preview"
  | "too-short"
  | "denied"
  | "unavailable"
  | "unsupported";

const MIN_RECORDING_MS = 1000;
const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm"];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transcriptPreview, setTranscriptPreview] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  // Unmount cleanup covers client-side navigation away from the practice
  // page mid-recording; the browser handles full tab/unload teardown itself.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const supportsRecording =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  const supportsTranscription =
    typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  async function startRecording() {
    setHasInteracted(true);

    if (!supportsRecording) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setStatus(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];
    transcriptRef.current = "";

    const mimeType = pickMimeType();
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();

    if (supportsTranscription) {
      const RecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition!;
      const recognition = new RecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        let finalChunk = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) finalChunk += result[0].transcript;
        }
        if (finalChunk) {
          transcriptRef.current = `${transcriptRef.current} ${finalChunk}`.trim();
        }
      };
      recognition.onerror = () => {
        // Live transcription is best-effort; keep recording audio regardless.
      };
      recognitionRef.current = recognition;
      recognition.start();
    }

    startTimeRef.current = Date.now();
    setElapsedMs(0);
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 200);

    setStatus("recording");
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    const duration = Date.now() - startTimeRef.current;
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    recorder.onstop = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (duration < MIN_RECORDING_MS) {
        setStatus("too-short");
        return;
      }

      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      setPreviewUrl(URL.createObjectURL(blob));
      setTranscriptPreview(transcriptRef.current);
      setStatus("preview");
    };
    recorder.stop();
  }

  function reRecord() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTranscriptPreview("");
    setStatus("idle");
  }

  function useRecording() {
    onTranscript(transcriptRef.current);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTranscriptPreview("");
    setStatus("idle");
  }

  if (status === "unsupported") {
    return (
      <p className="text-xs text-slate-500">
        Voice input isn&apos;t supported in this browser. Try Chrome or Edge, or write your answer above.
      </p>
    );
  }

  if (status === "recording") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
        </span>
        <span className="text-sm font-medium text-rose-300">Recording {formatDuration(elapsedMs)}</span>
        <Button
          type="button"
          variant="secondary"
          onClick={stopRecording}
          className="ml-auto min-h-11 min-w-11"
        >
          Stop
        </Button>
      </div>
    );
  }

  if (status === "preview" && previewUrl) {
    return (
      <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-900 p-3">
        <audio controls src={previewUrl} className="w-full" />
        {transcriptPreview ? (
          <p className="text-xs text-slate-400">
            Transcript preview: <span className="text-slate-200">{transcriptPreview}</span>
          </p>
        ) : (
          <p className="text-xs text-amber-400">
            No transcript was captured. You can still use the recording, then type your answer manually.
          </p>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={reRecord} className="min-h-11">
            Re-record
          </Button>
          <Button type="button" onClick={useRecording} className="min-h-11">
            Use this recording
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={startRecording}
        disabled={status === "requesting"}
        className="min-h-11 min-w-11"
      >
        {status === "requesting" ? <Spinner /> : <MicIcon />}
        {status === "requesting" ? "Requesting microphone..." : "Answer by voice"}
      </Button>

      {!hasInteracted && status === "idle" && (
        <span className="text-xs text-slate-500">You can also answer by voice</span>
      )}

      {status === "too-short" && (
        <span className="text-xs text-amber-400">
          That recording was too short. Please try again and speak for at least a second.
        </span>
      )}

      {status === "denied" && (
        <span className="text-xs text-rose-400">
          Microphone access is blocked. Enable it via the site permissions icon in your address bar, then
          try again.
        </span>
      )}

      {status === "unavailable" && (
        <span className="text-xs text-rose-400">
          Couldn&apos;t access a microphone. Check that one is connected and not in use by another app.
        </span>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M19 11a7 7 0 0 1-14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
