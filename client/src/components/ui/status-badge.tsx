interface StatusBadgeProps {
  status: "confirmed" | "cancelled";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        status === "confirmed"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status === "confirmed" ? "Подтверждено" : "Отменено"}
    </span>
  );
}
