import { useState, useEffect } from "react";
import { useAuth } from "@/store/auth";
import { useAvailability, useUpdateAvailability } from "@/hooks/availability";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { ScheduleItemRow } from "@/components/availability/ScheduleItemRow";
import { DEFAULT_START, DEFAULT_END } from "@/api/availability";
import type { components } from "@/api/generated/schema";

type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type WorkingHour = components["schemas"]["WorkingHour"];

const DAYS: { key: Day; label: string }[] = [
  { key: "mon", label: "Пн" },
  { key: "tue", label: "Вт" },
  { key: "wed", label: "Ср" },
  { key: "thu", label: "Чт" },
  { key: "fri", label: "Пт" },
  { key: "sat", label: "Сб" },
  { key: "sun", label: "Вс" },
];

interface ScheduleItem {
  dayOfWeek: Day;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

function buildInitial(workingHours: WorkingHour[]): ScheduleItem[] {
  return DAYS.map(({ key }) => {
    const existing = workingHours.find((wh) => wh.dayOfWeek === key);
    return {
      dayOfWeek: key,
      startTime: existing?.startTime ?? DEFAULT_START,
      endTime: existing?.endTime ?? DEFAULT_END,
      enabled: !!existing,
    };
  });
}

function defaultSchedule(): ScheduleItem[] {
  return DAYS.map(({ key }) => ({
    dayOfWeek: key,
    startTime: DEFAULT_START,
    endTime: DEFAULT_END,
    enabled: key !== "sat" && key !== "sun",
  }));
}

export function AdminAvailabilityPage() {
  const { user } = useAuth();
  const adminId = user?.id ?? "";

  const {
    data,
    isLoading,
    isError,
    error,
  } = useAvailability(adminId);
  const mutation = useUpdateAvailability(adminId);

  const [schedule, setSchedule] = useState<ScheduleItem[]>(defaultSchedule);
  const [initialized, setInitialized] = useState(false);
  const [initialData, setInitialData] = useState<string>("");
  const [dayErrors, setDayErrors] = useState<Record<string, string>>({});
  const [showSaveErrorModal, setShowSaveErrorModal] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      const built = buildInitial(data.workingHours);
      setSchedule(built);
      setInitialData(JSON.stringify(built));
      setInitialized(true);
    }
  }, [data, initialized]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (JSON.stringify(schedule) !== initialData) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [schedule, initialData]);

  useEffect(() => {
    const errors: Record<string, string> = {};
    for (const day of schedule) {
      if (day.enabled && day.startTime && day.endTime && day.startTime >= day.endTime) {
        errors[day.dayOfWeek] = "Начало должно быть раньше конца";
      }
    }
    setDayErrors(errors);
  }, [schedule]);

  if (isLoading) {
    return <PageSkeleton rows={7} />;
  }

  if (isError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-zinc-900">
          График работы
        </h1>
        <ErrorMessage
          message={error?.message ?? "Ошибка загрузки графика"}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">График работы</h1>

      <div className="rounded-lg border border-zinc-200 bg-white">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-4 border-b border-zinc-100 px-6 py-3 text-sm font-medium text-zinc-500">
          <span>День</span>
          <span>Начало</span>
          <span>Конец</span>
        </div>

        {schedule.map((day) => {
          const dayLabel = DAYS.find((d) => d.key === day.dayOfWeek)?.label ?? "";
          return (
            <ScheduleItemRow
              key={day.dayOfWeek}
              dayKey={day.dayOfWeek}
              label={dayLabel}
              enabled={day.enabled}
              startTime={day.startTime}
              endTime={day.endTime}
              error={dayErrors[day.dayOfWeek]}
              onToggle={(checked) =>
                setSchedule((prev) =>
                  prev.map((item) =>
                    item.dayOfWeek === day.dayOfWeek
                      ? { ...item, enabled: checked }
                      : item,
                  ),
                )
              }
              onStartTimeChange={(value) =>
                setSchedule((prev) =>
                  prev.map((item) =>
                    item.dayOfWeek === day.dayOfWeek
                      ? { ...item, startTime: value }
                      : item,
                  ),
                )
              }
              onEndTimeChange={(value) =>
                setSchedule((prev) =>
                  prev.map((item) =>
                    item.dayOfWeek === day.dayOfWeek
                      ? { ...item, endTime: value }
                      : item,
                  ),
                )
              }
            />
          );
        })}
      </div>

      <Button
        className="mt-6"
        onClick={() => {
          const hasErrors = Object.keys(dayErrors).length > 0;
          if (hasErrors) {
            setShowSaveErrorModal(true);
            return;
          }

          mutation.mutate({
            workingHours: schedule
              .filter((w) => w.enabled)
              .map(({ dayOfWeek, startTime, endTime }) => ({
                dayOfWeek,
                startTime,
                endTime,
              })),
          })
        }}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Сохранение..." : "Сохранить"}
      </Button>

      {mutation.isSuccess && (
        <p className="mt-2 text-sm text-green-600">График сохранён</p>
      )}

      {mutation.isError && (
        <div className="mt-2">
          <ErrorMessage
            message={mutation.error?.message ?? "Ошибка сохранения"}
          />
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
