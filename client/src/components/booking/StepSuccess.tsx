import { Copy, ArrowRight } from "lucide-react";
import { useBooking } from "@/store/booking";

export function StepSuccess() {
  const { confirmedMeet, reset } = useBooking();

  const handleCopy = () => {
    if (confirmedMeet?.inviteLink) {
      navigator.clipboard.writeText(confirmedMeet.inviteLink);
    }
  };

  return (
    <div className="flex flex-col items-center py-10">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-bold text-zinc-900">Встреча забронирована!</h2>

      {confirmedMeet && (
        <div className="mb-6 w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-4 text-sm">
          <p className="text-zinc-700">
            <span className="font-medium">Дата:</span>{" "}
            {new Date(confirmedMeet.startTime).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-zinc-700">
            <span className="font-medium">Организатор:</span> {confirmedMeet.adminName}
          </p>
          <p className="text-zinc-700">
            <span className="font-medium">Тема:</span> {confirmedMeet.theme}
          </p>
          <p className="mt-3 rounded bg-zinc-50 p-2 font-mono text-xs text-zinc-600">
            {confirmedMeet.inviteLink}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Copy className="h-4 w-4" />
          Копировать ссылку
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          Мои бронирования
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
