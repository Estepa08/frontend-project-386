import { TIME_SLOTS } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleTimeSelectProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function ScheduleTimeSelect({ value, disabled, onChange }: ScheduleTimeSelectProps) {
  return (
    <Select value={value} disabled={disabled} onValueChange={onChange}>
      <SelectTrigger>
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
