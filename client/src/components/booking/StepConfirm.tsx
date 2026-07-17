import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/store/auth";
import { useBooking } from "@/store/booking";
import { combineDateAndTime } from "@/api/booking";
import { useCreateMeet } from "@/hooks/booking";
import { categoryLabel, bookingFormSchema } from "@/lib/booking";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/error-message";
import { StepNav } from "./StepNav";
import { Plus, X } from "lucide-react";

export function StepConfirm() {
  const { user } = useAuth();
  const {
    admin,
    date,
    slot,
    meetingType,
    theme,
    comment,
    guests,
    setTheme,
    setComment,
    addGuest,
    removeGuest,
    updateGuest,
    setStep,
    setConfirmedMeet,
  } = useBooking();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const mutation = useCreateMeet();

  const handleSubmit = () => {
    const parsed = bookingFormSchema.safeParse({ theme, comment, guests });
    if (!parsed.success) {
      setSubmitError(parsed.error.errors[0].message);
      return;
    }
    setSubmitError(null);

    if (!admin || !user || !meetingType || !date || !slot) {
      setSubmitError("Не все данные заполнены");
      return;
    }

    mutation.mutate(
      {
        adminId: admin.id,
        userId: user.id,
        meetingTypeId: meetingType.id,
        startTime: combineDateAndTime(date, slot.startTime),
        endTime: combineDateAndTime(date, slot.endTime),
        theme: parsed.data.theme,
        comment: parsed.data.comment || undefined,
        guestEmails: parsed.data.guests.filter((email) => email.trim() !== ""),
      },
      {
        onSuccess: (data) => {
          setConfirmedMeet({
            inviteLink: data.inviteLink,
            startTime: data.startTime,
            theme: data.theme,
            adminName: admin?.name ?? "",
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
        <p className="font-medium text-zinc-900">{admin?.name}</p>
        <p className="mt-1 text-zinc-600">
          {date && format(date, "d MMMM yyyy, EEEE", { locale: ru })} ·{" "}
          {slot?.startTime.slice(0, 5)} – {slot?.endTime.slice(0, 5)}
        </p>
        <p className="text-zinc-500">
          {meetingType?.duration} мин · {categoryLabel(meetingType?.category ?? "")}
        </p>
      </div>

      {submitError && <ErrorMessage message={submitError} />}

      <div className="space-y-4" data-container="form--booking">
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

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Комментарий
          </label>
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Необязательно"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Гости
          </label>
          <div className="space-y-2">
            {guests.map((email, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={email}
                  onChange={(e) => updateGuest(index, e.target.value)}
                  placeholder="email@example.com"
                  type="email"
                  inputMode="email"
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                />
                <button
                  onClick={() => removeGuest(index)}
                  className="shrink-0 text-sm text-zinc-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addGuest}
              className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700"
            >
              <Plus className="h-4 w-4" />
              Добавить гостя
            </button>
          </div>
        </div>
      </div>

      <StepNav
        onBack={() => setStep(2)}
        onNext={handleSubmit}
        isNextDisabled={mutation.isPending}
        nextLabel="Забронировать"
        isSubmitting={mutation.isPending}
      />
    </div>
  );
}
