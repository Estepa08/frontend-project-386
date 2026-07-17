import { useState, useEffect } from "react";
import { DAYS, DEFAULT_START, DEFAULT_END, type Day } from "@/lib/constants";
import type { components } from "@/api/generated/schema";

type WorkingHour = components["schemas"]["WorkingHour"];

interface ScheduleItem {
  dayOfWeek: Day;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

function buildInitial(workingHours: WorkingHour[]): ScheduleItem[] {
  return DAYS.map((key) => {
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
  return DAYS.map((key) => ({
    dayOfWeek: key,
    startTime: DEFAULT_START,
    endTime: DEFAULT_END,
    enabled: key !== "sat" && key !== "sun",
  }));
}

export function useSchedule(workingHours: WorkingHour[] | undefined) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(defaultSchedule);
  const [initialized, setInitialized] = useState(false);
  const [initialData, setInitialData] = useState<string>("");
  const [dayErrors, setDayErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (workingHours && !initialized) {
      const built = buildInitial(workingHours);
      setSchedule(built);
      setInitialData(JSON.stringify(built));
      setInitialized(true);
    }
  }, [workingHours, initialized]);

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

  const onToggle = (dayOfWeek: Day, checked: boolean) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.dayOfWeek === dayOfWeek ? { ...item, enabled: checked } : item,
      ),
    );
  };

  const onStartTimeChange = (dayOfWeek: Day, value: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.dayOfWeek === dayOfWeek ? { ...item, startTime: value } : item,
      ),
    );
  };

  const onEndTimeChange = (dayOfWeek: Day, value: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.dayOfWeek === dayOfWeek ? { ...item, endTime: value } : item,
      ),
    );
  };

  const hasErrors = Object.keys(dayErrors).length > 0;
  const payload = schedule
    .filter((w) => w.enabled)
    .map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }));

  return {
    schedule,
    dayErrors,
    hasErrors,
    onToggle,
    onStartTimeChange,
    onEndTimeChange,
    payload,
  };
}
