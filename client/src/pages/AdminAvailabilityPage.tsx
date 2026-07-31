import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAvailability, useUpdateAvailability } from "@/hooks/availability";
import { useSchedule } from "@/hooks/useSchedule";
import { Button, ErrorMessage, ConfirmDialog, PageSkeleton, Switch } from "@/components/ui";
import { ScheduleItemRow } from "@/components/availability";
import { DAY_LABELS, SLOT_DURATIONS, SLOT_DURATION_LABELS, type SlotDuration } from "@/lib/constants";

export function AdminAvailabilityPage() {
  const { data, isLoading, isError, error } = useAvailability();
  const mutation = useUpdateAvailability();

  const [durations, setDurations] = useState<SlotDuration[]>(["15", "30"]);
  const [durationsInitialized, setDurationsInitialized] = useState(false);

  useEffect(() => {
    if (data?.slotDurations && !durationsInitialized) {
      setDurations(data.slotDurations);
      setDurationsInitialized(true);
    }
  }, [data, durationsInitialized]);

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

  const noDurationsEnabled = durations.length === 0;

  const handleToggleDuration = (duration: SlotDuration, checked: boolean) => {
    setDurations((prev) =>
      checked
        ? [...new Set([...prev, duration])]
        : prev.filter((item) => item !== duration),
    );
  };

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

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white px-6 py-4" data-container="section--durations">
        <p className="mb-4 text-sm font-medium text-zinc-700">Длительность встречи</p>
        <div className="space-y-3">
          {SLOT_DURATIONS.map((duration) => (
            <label
              key={duration}
              className="flex items-center justify-between gap-4 text-sm text-zinc-700"
              data-container={`duration-row--${duration}`}
            >
              {SLOT_DURATION_LABELS[duration]}
              <Switch
                checked={durations.includes(duration)}
                onCheckedChange={(checked) => handleToggleDuration(duration, checked)}
              />
            </label>
          ))}
        </div>
        {noDurationsEnabled && (
          <p className="mt-3 text-sm text-red-600">Выберите хотя бы одну длительность</p>
        )}
      </div>

      <Button
        className="mt-6"
        onClick={() => {
          if (hasErrors || noDurationsEnabled) {
            setShowSaveErrorModal(true);
            return;
          }
          mutation.mutate({ workingHours: payload, slotDurations: durations });
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
        description="Исправьте формат времени или выберите хотя бы одну длительность перед сохранением"
        confirmLabel="Понятно"
        onConfirm={() => setShowSaveErrorModal(false)}
      />
    </div>
  );
}
