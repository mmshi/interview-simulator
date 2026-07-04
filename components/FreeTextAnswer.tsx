import { VoiceRecorder } from "@/components/VoiceRecorder";

interface FreeTextAnswerProps {
  value: string;
  onChange: (value: string) => void;
}

export function FreeTextAnswer({ value, onChange }: FreeTextAnswerProps) {
  function handleTranscript(transcript: string) {
    if (!transcript) return;
    onChange(value.trim() ? `${value.trim()} ${transcript}` : transcript);
  }

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your answer here, or use the mic below..."
        rows={8}
        className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
      />
      <VoiceRecorder onTranscript={handleTranscript} />
    </div>
  );
}
