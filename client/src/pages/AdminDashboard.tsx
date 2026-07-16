import { Link } from "react-router-dom";
import { format, isToday, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import { Plus, Clock, Calendar } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useMeets } from "@/hooks/meets";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import type { MeetResult } from "@/api/meets";

function formatTime(iso: string) {
  return format(parseISO(iso), "HH:mm");
}

export function AdminDashboard() {
  const { role, user } = useAuth();

  const todayString = format(new Date(), "yyyy-MM-dd");

  const {
    data: allMeets,
    isLoading: allLoading,
    isError: allError,
    error: allErrorObj,
  } = useMeets(role as "admin", user?.id ?? "");

  const {
    data: todayMeets,
    isLoading: todayLoading,
  } = useMeets(role as "admin", user?.id ?? "", { date: todayString });

  const items = (allMeets as MeetResult[]) ?? [];
  const todayItems = (todayMeets as MeetResult[]) ?? [];

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const stats = {
    today: items.filter(
      (m) => m.status === "confirmed" && isToday(parseISO(m.startTime)),
    ).length,
    week: items.filter(
      (m) =>
        m.status === "confirmed" &&
        isWithinInterval(parseISO(m.startTime), { start: weekStart, end: weekEnd }),
    ).length,
    cancelled: items.filter(
      (m) =>
        m.status === "cancelled" &&
        isWithinInterval(parseISO(m.startTime), { start: weekStart, end: weekEnd }),
    ).length,
  };

  const sortedTodayMeets = [...todayItems].sort(
    (a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime(),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Обзор</h1>

      {allError && (
        <ErrorMessage message={allErrorObj?.message ?? "Ошибка загрузки данных"} />
      )}

      <div className="grid grid-cols-3 gap-4">
        {allLoading ? (
          <>
            <div className="h-20 animate-pulse rounded-lg bg-zinc-100" />
            <div className="h-20 animate-pulse rounded-lg bg-zinc-100" />
            <div className="h-20 animate-pulse rounded-lg bg-zinc-100" />
          </>
        ) : (
          <>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Сегодня</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">{stats.today}</p>
              <p className="text-xs text-zinc-500">подтверждённых встреч</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Неделя</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">{stats.week}</p>
              <p className="text-xs text-zinc-500">подтверждённых встреч</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Отменено</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{stats.cancelled}</p>
              <p className="text-xs text-zinc-500">на этой неделе</p>
            </div>
          </>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700">Сегодняшние встречи</h2>

        {todayLoading && (
          <p className="py-8 text-center text-sm text-zinc-400">Загрузка...</p>
        )}

        {!todayLoading && sortedTodayMeets.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-zinc-400">Нет встреч на сегодня</p>
            <Link
              to="/admin/meets"
              className="mt-2 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              → Все встречи
            </Link>
          </div>
        )}

        {!todayLoading && sortedTodayMeets.length > 0 && (
          <div className="space-y-2">
            {sortedTodayMeets.map((meet) => (
              <div
                key={meet.id}
                className="flex items-center gap-4 rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3"
              >
                <span className="shrink-0 text-sm font-medium text-zinc-900">
                  {formatTime(meet.startTime)} — {formatTime(meet.endTime)}
                </span>
                <span className="text-sm text-zinc-600">{meet.theme}</span>
                <span className="text-sm text-zinc-400">{meet.userName}</span>
                <span className="ml-auto">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      meet.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {meet.status === "confirmed" ? "Подтверждено" : "Отменено"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">Быстрые действия</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link to="/admin/meeting-types">
              <Plus className="mr-2 h-4 w-4" />
              Новый тип встречи
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/availability">
              <Clock className="mr-2 h-4 w-4" />
              График
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/meets">
              <Calendar className="mr-2 h-4 w-4" />
              Все встречи
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
