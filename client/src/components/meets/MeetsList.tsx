import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useMeets, useCancelMeet } from "@/hooks/meets";
import { ErrorMessage } from "@/components/ui/error-message";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import type { components } from "@/api/generated/schema";

type Meet = components["schemas"]["Meet"] & {
  adminName?: string;
  userName?: string;
};

interface MeetsListProps {
  title: string;
  role: "admin" | "user";
  nameField: "userName" | "adminName";
  nameColumnLabel: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "confirmed", label: "Подтверждено" },
  { value: "cancelled", label: "Отменено" },
] as const;

export function MeetsList({ title, role, nameField, nameColumnLabel }: MeetsListProps) {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "cancelled">("all");
  const [dateFilter, setDateFilter] = useState("");

  const { data: meets, isLoading, isError, error } = useMeets(role, user?.id ?? "", {
    status: statusFilter === "all" ? undefined : statusFilter,
    date: dateFilter || undefined,
  });

  const cancelMutation = useCancelMeet();

  const items: Meet[] = Array.isArray(meets) ? meets : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">{title}</h1>

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
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{nameColumnLabel}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Тема</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((meet) => (
                <tr key={meet.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 text-zinc-900">{formatDate(meet.startTime)}</td>
                  <td className="px-4 py-3 text-zinc-600">{meet[nameField]}</td>
                  <td className="px-4 py-3 text-zinc-600">{meet.theme}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={meet.status} />
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
