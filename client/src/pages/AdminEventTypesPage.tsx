import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { useEventTypes, useDeleteEventType } from "@/hooks/event-types";
import { Button, ErrorMessage, PageSkeleton, ConfirmDialog } from "@/components/ui";
import { EventTypeDialog } from "@/components/event-types";
import { ApiRequestError } from "@/api/client";
import type { EventType } from "@/api/event-types";

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

export function AdminEventTypesPage() {
  const { data: eventTypes, isLoading, isError, error } = useEventTypes();
  const deleteMutation = useDeleteEventType();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [deleting, setDeleting] = useState<EventType | null>(null);

  const items: EventType[] = Array.isArray(eventTypes) ? eventTypes : [];

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      toast.success("Тип события удалён");
    } catch (deleteError) {
      if (deleteError instanceof ApiRequestError && deleteError.code === "EVENT_TYPE_IN_USE") {
        toast.error("Нельзя удалить: есть подтверждённые встречи этого типа");
      } else {
        toast.error("Ошибка при удалении типа события");
      }
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div data-container="page--event-types">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Типы событий</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Новый тип
        </Button>
      </div>

      {isLoading && <PageSkeleton rows={4} />}

      {isError && (
        <ErrorMessage message={error?.message ?? "Ошибка загрузки типов событий"} />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Clock className="h-12 w-12 text-zinc-300" aria-hidden="true" />
          <p className="text-sm text-zinc-400">Типы событий не созданы</p>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="space-y-3" data-container="list--event-types">
          {items.map((eventType) => (
            <div
              key={eventType.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 bg-white px-5 py-4"
              data-container={`event-type-row--${eventType.id}`}
            >
              <div className="min-w-0">
                <p className="font-medium text-zinc-900">{eventType.title}</p>
                {eventType.description && (
                  <p className="mt-0.5 truncate text-sm text-zinc-500">{eventType.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-sm font-medium text-zinc-700">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {formatDuration(eventType.durationMinutes)}
                </span>
                <button
                  type="button"
                  onClick={() => { setEditing(eventType); setDialogOpen(true); }}
                  aria-label={`Редактировать ${eventType.title}`}
                  className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(eventType)}
                  aria-label={`Удалить ${eventType.title}`}
                  className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EventTypeDialog
        eventType={editing}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Удалить тип события?"
        description={
          deleting
            ? `«${deleting.title}» больше не будет доступен гостям для бронирования.`
            : ""
        }
        confirmLabel="Удалить"
        onConfirm={handleDelete}
      />
    </div>
  );
}
