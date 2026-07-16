import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useMeets, useCancelMeet } from "@/hooks/meets";
import { ErrorMessage } from "@/components/ui/error-message";
import type { MeetResult } from "@/api/meets";

const STATUS_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "confirmed", label: "Подтверждено" },
  { value: "cancelled", label: "Отменено" },
] as const;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UserMeetsPage() {
  const { role, user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "cancelled">("all");
  const [dateFilter, setDateFilter] = useState("");

  const { data: meets, isLoading, isError, error } = useMeets(
    role as "user",
    user?.id ?? "",
    {
      status: statusFilter === "all" ? undefined : statusFilter,
      date: dateFilter || undefined,
    },
  );

  const cancelMutation = useCancelMeet();

  const items = (meets as MeetResult[]) ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Мои встречи</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-zinc-200 p-0.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === opt.value
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900"
        />

        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Сбросить
          </button>
        )}
      </div>

      {isLoading && (
        <p className="py-10 text-center text-sm text-zinc-400">Загрузка...</p>
      )}

      {isError && (
        <ErrorMessage message={error?.message ?? "Ошибка загрузки встреч"} />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <p className="py-10 text-center text-sm text-zinc-400">Нет встреч</p>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Дата / время</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Администратор</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Тема</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((meet) => (
                <tr key={meet.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 text-zinc-900">{formatDate(meet.startTime)}</td>
                  <td className="px-4 py-3 text-zinc-600">{meet.adminName}</td>
                  <td className="px-4 py-3 text-zinc-600">{meet.theme}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        meet.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {meet.status === "confirmed" ? "Подтверждено" : "Отменено"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/meets/${meet.id}`}
                      className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                    >
                      Подробнее
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cancelMutation.isError && (
        <div className="mt-4">
          <ErrorMessage
            message={cancelMutation.error?.message ?? "Ошибка при отмене встречи"}
          />
        </div>
      )}
    </div>
  );
}
