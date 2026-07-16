import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

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

interface WorkingHour {
  dayOfWeek: Day;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";

function buildInitial(workingHours: { dayOfWeek: Day; startTime: string; endTime: string }[]): WorkingHour[] {
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

export function AdminAvailabilityPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["availability"],
    queryFn: () =>
      fetch(`/api/admins/${user?.id}/availability`).then((r) => r.json()),
  });

  const [schedule, setSchedule] = useState<WorkingHour[]>(() =>
    data ? buildInitial(data.workingHours) : DAYS.map(({ key }) => ({
      dayOfWeek: key,
      startTime: DEFAULT_START,
      endTime: DEFAULT_END,
      enabled: key !== "sat" && key !== "sun",
    })),
  );

  const mutation = useMutation({
    mutationFn: (wh: WorkingHour[]) =>
      fetch(`/api/admins/${user?.id}/availability`, {
        method: "PUT",
        body: JSON.stringify({
          workingHours: wh.filter((w) => w.enabled).map(({ dayOfWeek, startTime, endTime }) => ({
            dayOfWeek, startTime, endTime,
          })),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-zinc-400">Загрузка...</div>;
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
              <Label htmlFor={day.dayOfWeek}>{DAYS.find((d) => d.key === day.dayOfWeek)?.label}</Label>
            </div>

            <Select
              value={day.enabled ? day.startTime : ""}
              disabled={!day.enabled}
              onValueChange={(val) =>
                setSchedule((prev) =>
                  prev.map((d) =>
                    d.dayOfWeek === day.dayOfWeek ? { ...d, startTime: val } : d,
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
                    d.dayOfWeek === day.dayOfWeek ? { ...d, endTime: val } : d,
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
        onClick={() => mutation.mutate(schedule)}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Сохранение..." : "Сохранить"}
      </Button>

      {mutation.isSuccess && (
        <p className="mt-2 text-sm text-green-600">График сохранён</p>
      )}
    </div>
  );
}
