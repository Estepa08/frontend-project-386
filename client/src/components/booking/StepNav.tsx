import { ArrowLeft, Loader2 } from "lucide-react";

interface StepNavProps {
  onBack?: () => void;
  onNext?: () => void;
  isNextDisabled?: boolean;
  nextLabel?: string;
  isSubmitting?: boolean;
}

export function StepNav({ onBack, onNext, isNextDisabled, nextLabel, isSubmitting }: StepNavProps) {
  return (
    <div className="mt-8 flex items-center justify-between">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          disabled={isNextDisabled || isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Бронирование..." : (nextLabel ?? "Далее")}
        </button>
      )}
    </div>
  );
}
