import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useBooking } from "@/store/booking";
import { combineDateAndTime } from "@/lib/utils";
import { useCreateMeet } from "@/hooks/booking";
import { bookingFormSchema } from "@/lib/booking";
import { Input, ErrorMessage } from "@/components/ui";
import { StepNav } from "./StepNav";

export function StepConfirm() {
  const {
    date,
    slot,
    duration,
    name,
    email,
    theme,
    setName,
    setEmail,
    setTheme,
    setStep,
    setConfirmedMeet,
  } = useBooking();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const mutation = useCreateMeet();

  const handleSubmit = () => {
    const parsed = bookingFormSchema.safeParse({ name, email, theme });
    if (!parsed.success) {
      setSubmitError(parsed.error.errors[0].message);
      return;
    }
    setSubmitError(null);

    if (!date || !slot) {
      setSubmitError("Не все данные заполнены");
      return;
    }

    mutation.mutate(
      {
        name: parsed.data.name,
        email: parsed.data.email || undefined,
        theme: parsed.data.theme,
        startTime: combineDateAndTime(date, slot.startTime),
        endTime: combineDateAndTime(date, slot.endTime),
      },
      {
        onSuccess: (data) => {
          setConfirmedMeet({
            inviteLink: data.inviteLink,
            startTime: data.startTime,
            theme: data.theme,
          });
          setSubmitError(null);
        },
        onError: (err) => {
          setSubmitError(err instanceof Error ? err.message : "Ошибка при бронировании");
        },
      },
    );
  };

  return (
    <div data-container="step--confirm">
      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 text-sm" data-container="card--booking-summary">
        <p className="mt-1 text-zinc-600">
          {date && format(date, "d MMMM yyyy, EEEE", { locale: ru })} ·{" "}
          {slot?.startTime.slice(0, 5)} – {slot?.endTime.slice(0, 5)} · {duration ?? ""} мин
        </p>
      </div>

      {submitError && <ErrorMessage message={submitError} />}

      <div className="space-y-4" data-container="form--booking">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Ваше имя <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Иван Петров"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Тема <span className="text-red-500">*</span>
          </label>
          <Input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Например: Консультация по проекту"
          />
        </div>
      </div>

      <StepNav
        onBack={() => setStep(1)}
        onNext={handleSubmit}
        isNextDisabled={mutation.isPending}
        nextLabel="Забронировать"
        isSubmitting={mutation.isPending}
      />
    </div>
  );
}
