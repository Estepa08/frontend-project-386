import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useMeets } from "@/hooks/meets";
import { ErrorMessage } from "@/components/ui/error-message";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { formatDate } from "@/lib/utils";
import { CalendarX } from "lucide-react";
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

  const items: Meet[] = Array.isArray(meets) ? meets : [];

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const pageItems = items.slice(0, page * PAGE_SIZE);
  const hasMore = pageItems.length < items.length;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">{title}</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-zinc-200 p-0.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setPage(1); }}
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

        <label htmlFor="date-filter" className="sr-only">Фильтр по дате</label>
        <input
          id="date-filter"
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
        <PageSkeleton rows={5} />
      )}

      {isError && (
        <ErrorMessage message={error?.message ?? "Ошибка загрузки встреч"} />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16">
          <CalendarX className="h-12 w-12 text-zinc-300" />
          <p className="text-sm text-zinc-400">Нет встреч</p>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="hidden md:block overflow-hidden rounded-lg border border-zinc-200">
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
                {pageItems.map((meet) => (
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

          <div className="md:hidden space-y-3">
            {pageItems.map((meet) => (
              <div key={meet.id} className="rounded-lg border border-zinc-200 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-900">{formatDate(meet.startTime)}</span>
                  <StatusBadge status={meet.status} />
                </div>
                <p className="text-sm text-zinc-600">{meet[nameField]}</p>
                <p className="text-sm text-zinc-600">{meet.theme}</p>
                <Link
                  to={`/meets/${meet.id}`}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Подробнее →
                </Link>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-zinc-200 px-6 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              >
                Показать ещё
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}
