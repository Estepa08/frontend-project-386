import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScheduleTimeSelect } from "./ScheduleTimeSelect";

type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

interface ScheduleItemRowProps {
  dayKey: Day;
  label: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  error?: string;
  onToggle: (checked: boolean) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

export function ScheduleItemRow({
  dayKey,
  label,
  enabled,
  startTime,
  endTime,
  error,
  onToggle,
  onStartTimeChange,
  onEndTimeChange,
}: ScheduleItemRowProps) {
  return (
    <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-1 border-b border-zinc-50 px-6 py-3 last:border-0" data-container="schedule-row">
      <div className="flex items-center gap-3 row-span-2">
        <Checkbox
          id={dayKey}
          checked={enabled}
          onCheckedChange={(checked) => onToggle(checked === true)}
        />
        <Label htmlFor={dayKey}>{label}</Label>
      </div>

      <ScheduleTimeSelect
        value={enabled ? startTime : ""}
        disabled={!enabled}
        error={!!error}
        onChange={onStartTimeChange}
      />

      <ScheduleTimeSelect
        value={enabled ? endTime : ""}
        disabled={!enabled}
        error={!!error}
        onChange={onEndTimeChange}
      />

      {error && (
        <p className="col-span-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
