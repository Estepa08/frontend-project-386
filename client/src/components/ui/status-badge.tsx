import { MEET_STATUS, STATUS_LABELS, type MeetStatus } from "@/lib/constants";

interface StatusBadgeProps {
  status: MeetStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        status === MEET_STATUS.CONFIRMED
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
