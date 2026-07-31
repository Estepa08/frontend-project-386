import { useBooking } from "@/store/booking";
import { cn } from "@/lib/utils";
import { StepDateTime } from "./StepDateTime";
import { StepConfirm } from "./StepConfirm";
import { StepSuccess } from "./StepSuccess";

const STEPS = [
  { num: 1, label: "Дата и время" },
  { num: 2, label: "Подтверждение" },
];

function formatDuration(durationMinutes: number): string {
  return `${durationMinutes} мин`;
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-0" data-container="step-indicator">
      {STEPS.map((s, i) => {
        const isActive = step === s.num;
        const isDone = step > s.num;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  isActive && "bg-zinc-900 text-white",
                  isDone && "bg-green-600 text-white",
                  !isActive && !isDone && "border border-zinc-300 text-zinc-400",
                )}
              >
                {isDone ? "✓" : s.num}
              </div>
              <span
                className={cn(
                  "text-xs",
                  isActive ? "font-medium text-zinc-900" : "text-zinc-400",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-6 h-px w-12 sm:w-20",
                  isDone ? "bg-green-600" : "bg-zinc-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BookingWizard() {
  const eventType = useBooking((state) => state.eventType);
  const step = useBooking((state) => state.step);
  const reset = useBooking((state) => state.reset);

  if (!eventType) return null;

  return (
    <div className="mx-auto max-w-3xl" data-container="booking-wizard">
      <div
        className="mb-6 flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-5 py-4"
        data-container="card--event-type-summary"
      >
        <div>
          <p className="text-lg font-semibold text-zinc-900">{eventType.title}</p>
          {eventType.description && (
            <p className="mt-0.5 text-sm text-zinc-500">{eventType.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-sm font-medium text-zinc-700">
            {formatDuration(eventType.durationMinutes)}
          </span>
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            Сменить тип
          </button>
        </div>
      </div>

      {step < 3 && <StepIndicator step={step} />}

      {step === 1 && <StepDateTime />}
      {step === 2 && <StepConfirm />}
      {step === 3 && <StepSuccess />}
    </div>
  );
}
