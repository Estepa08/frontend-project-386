import { Clock, CalendarDays } from "lucide-react";
import { useEventTypes } from "@/hooks/event-types";
import { useBooking } from "@/store/booking";
import { BookingWizard } from "@/components/booking";
import { ErrorMessage, PageSkeleton } from "@/components/ui";
import type { components } from "@/api/generated/schema";

type EventType = components["schemas"]["EventType"];

function formatDuration(durationMinutes: number): string {
  if (durationMinutes % 60 === 0) {
    return `${durationMinutes / 60} ч`;
  }
  if (durationMinutes > 60) {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours} ч ${minutes} мин`;
  }
  return `${durationMinutes} мин`;
}

function EventTypeCard({
  eventType,
  onClick,
}: {
  eventType: EventType;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-container={`event-type-card--${eventType.id}`}
      className="group flex w-full items-start gap-4 rounded-xl border border-zinc-200 bg-white p-6 text-left transition-colors hover:border-zinc-900"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
        <CalendarDays className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold text-zinc-900">{eventType.title}</span>
        {eventType.description && (
          <span className="mt-1 block text-sm text-zinc-500">{eventType.description}</span>
        )}
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-sm font-medium text-zinc-700">
        <Clock className="h-4 w-4" aria-hidden="true" />
        {formatDuration(eventType.durationMinutes)}
      </span>
    </button>
  );
}

export function BookingPage() {
  const eventType = useBooking((state) => state.eventType);
  const setEventType = useBooking((state) => state.setEventType);

  const { data: eventTypes, isLoading, isError, error } = useEventTypes();

  if (eventType) {
    return <BookingWizard />;
  }

  return (
    <div className="mx-auto max-w-2xl" data-container="page--booking-types">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Выберите тип встречи</h1>
        <p className="mt-2 text-zinc-500">Запись доступна на 14 дней вперёд</p>
      </div>

      {isLoading && <PageSkeleton rows={3} />}

      {isError && (
        <ErrorMessage message={error?.message ?? "Ошибка загрузки типов событий"} />
      )}

      {!isLoading && !isError && (eventTypes?.length ?? 0) === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <CalendarDays className="h-12 w-12 text-zinc-300" aria-hidden="true" />
          <p className="text-sm text-zinc-400">Типы событий ещё не настроены</p>
          <p className="text-xs text-zinc-400">Загляните позже</p>
        </div>
      )}

      {!isLoading && !isError && (eventTypes?.length ?? 0) > 0 && (
        <div className="grid gap-4" data-container="grid--event-types">
          {eventTypes!.map((type) => (
            <EventTypeCard
              key={type.id}
              eventType={type}
              onClick={() => setEventType(type)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
