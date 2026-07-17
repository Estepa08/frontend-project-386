import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";
import { useAvailability, useUpdateAvailability } from "@/hooks/availability";
import { useSchedule } from "@/hooks/useSchedule";
import { Button, ErrorMessage, ConfirmDialog, PageSkeleton } from "@/components/ui";
import { ScheduleItemRow } from "@/components/availability";
import { DAY_LABELS } from "@/lib/constants";

export function AdminAvailabilityPage() {
  const { user } = useAuth();
  const adminId = user?.id ?? "";

  const { data, isLoading, isError, error } = useAvailability(adminId);
  const mutation = useUpdateAvailability(adminId);

  useEffect(() => {
    if (mutation.isSuccess) {
      toast.success("График сохранён");
    }
  }, [mutation.isSuccess]);

  const {
    schedule,
    dayErrors,
    hasErrors,
    onToggle,
    onStartTimeChange,
    onEndTimeChange,
    payload,
  } = useSchedule(data?.workingHours);

  const [showSaveErrorModal, setShowSaveErrorModal] = useState(false);

  if (isLoading) {
    return <PageSkeleton rows={7} />;
  }

  if (isError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-zinc-900">График работы</h1>
        <ErrorMessage message={error?.message ?? "Ошибка загрузки графика"} />
      </div>
    );
  }

  return (
    <div data-container="page--availability">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">График работы</h1>

      <div className="rounded-lg border border-zinc-200 bg-white" data-container="section--schedule">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-4 border-b border-zinc-100 px-6 py-3 text-sm font-medium text-zinc-500" data-container="schedule-header">
          <span>День</span>
          <span>Начало</span>
          <span>Конец</span>
        </div>

        {schedule.map((day) => (
          <ScheduleItemRow
            key={day.dayOfWeek}
            dayKey={day.dayOfWeek}
            label={DAY_LABELS[day.dayOfWeek]}
            enabled={day.enabled}
            startTime={day.startTime}
            endTime={day.endTime}
            error={dayErrors[day.dayOfWeek]}
            onToggle={(checked) => onToggle(day.dayOfWeek, checked)}
            onStartTimeChange={(value) => onStartTimeChange(day.dayOfWeek, value)}
            onEndTimeChange={(value) => onEndTimeChange(day.dayOfWeek, value)}
          />
        ))}
      </div>

      <Button
        className="mt-6"
        onClick={() => {
          if (hasErrors) {
            setShowSaveErrorModal(true);
            return;
          }
          mutation.mutate({ workingHours: payload });
        }}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Сохранение..." : "Сохранить"}
      </Button>

      {mutation.isError && (
        <div className="mt-2">
          <ErrorMessage message={mutation.error?.message ?? "Ошибка сохранения"} />
        </div>
      )}

      <ConfirmDialog
        open={showSaveErrorModal}
        onOpenChange={setShowSaveErrorModal}
        title="Ошибка в расписании"
        description="Исправьте формат времени в отмеченных днях перед сохранением"
        confirmLabel="Понятно"
        onConfirm={() => setShowSaveErrorModal(false)}
      />
    </div>
  );
}
