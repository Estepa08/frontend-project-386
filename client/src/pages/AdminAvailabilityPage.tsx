import { useState, useEffect } from "react";
import { useAuth } from "@/store/auth";
import { useAvailability, useUpdateAvailability } from "@/hooks/availability";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "@/components/ui/error-message";
import type { WorkingHour } from "@/api/availability";

type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const DAYS: { key: Day; label: string }[] = [
  { key: "mon", label: "Пн" },
  { key: "tue", label: "Вт" },
  { key: "wed", label: "Ср" },
  { key: "thu", label: "Чт" },
  { key: "fri", label: "Пт" },
  { key: "sat", label: "Сб" },
  { key: "sun", label: "Вс" },
];

const TIME_SLOTS = Array.from({ length: 19 }, (_, i) => {
  const h = Math.floor(i / 2) + 9;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

interface ScheduleItem {
  dayOfWeek: Day;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";

function buildInitial(
  workingHours: WorkingHour[],
): ScheduleItem[] {
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

  useEffect(() => {
    if (data && !initialized) {
      setSchedule(buildInitial(data.workingHours));
      setInitialized(true);
    }
  }, [data, initialized]);

  if (isLoading) {
    return (
      <div className="py-10 text-center text-sm text-zinc-400">
        Загрузка...
      </div>
    );
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

        {schedule.map((day) => (
          <div
            key={day.dayOfWeek}
            className="grid grid-cols-[auto_1fr_1fr] gap-4 border-b border-zinc-50 px-6 py-3 last:border-0"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id={day.dayOfWeek}
                checked={day.enabled}
                onCheckedChange={(checked) =>
                  setSchedule((prev) =>
                    prev.map((d) =>
                      d.dayOfWeek === day.dayOfWeek
                        ? { ...d, enabled: checked === true }
                        : d,
                    ),
                  )
                }
              />
              <Label htmlFor={day.dayOfWeek}>
                {DAYS.find((d) => d.key === day.dayOfWeek)?.label}
              </Label>
            </div>

            <Select
              value={day.enabled ? day.startTime : ""}
              disabled={!day.enabled}
              onValueChange={(val) =>
                setSchedule((prev) =>
                  prev.map((d) =>
                    d.dayOfWeek === day.dayOfWeek
                      ? { ...d, startTime: val }
                      : d,
                  ),
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="--" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={day.enabled ? day.endTime : ""}
              disabled={!day.enabled}
              onValueChange={(val) =>
                setSchedule((prev) =>
                  prev.map((d) =>
                    d.dayOfWeek === day.dayOfWeek
                      ? { ...d, endTime: val }
                      : d,
                  ),
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="--" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <Button
        className="mt-6"
        onClick={() =>
          mutation.mutate({
            workingHours: schedule
              .filter((w) => w.enabled)
              .map(({ dayOfWeek, startTime, endTime }) => ({
                dayOfWeek,
                startTime,
                endTime,
              })),
          })
        }
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
    </div>
  );
}
