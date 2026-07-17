import { TIME_SLOTS } from "@/lib/constants";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui";

interface ScheduleTimeSelectProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  error?: boolean;
}

export function ScheduleTimeSelect({ value, disabled, onChange, error }: ScheduleTimeSelectProps) {
  return (
    <Select value={value} disabled={disabled} onValueChange={onChange}>
      <SelectTrigger className={error ? "border-red-500 focus:ring-0" : ""}>
        <SelectValue placeholder="--" />
      </SelectTrigger>
      <SelectContent>
        {TIME_SLOTS.map((timeSlot) => (
          <SelectItem key={timeSlot} value={timeSlot}>
            {timeSlot}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
