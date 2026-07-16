import { useBooking } from "@/store/booking";
import { cn } from "@/lib/utils";
import { StepSelectAdmin } from "./StepSelectAdmin";
import { StepDateTime } from "./StepDateTime";
import { StepConfirm } from "./StepConfirm";
import { StepSuccess } from "./StepSuccess";

const STEPS = [
  { num: 1, label: "Выбор организатора" },
  { num: 2, label: "Дата и время" },
  { num: 3, label: "Подтверждение" },
];

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-0">
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
  const { step } = useBooking();

  return (
    <div className="mx-auto max-w-3xl">
      <StepIndicator step={step} />

      {step === 1 && <StepSelectAdmin />}
      {step === 2 && <StepDateTime />}
      {step === 3 && <StepConfirm />}
      {step === 4 && <StepSuccess />}
    </div>
  );
}
