import { useState } from "react";
import { useAuth } from "@/store/auth";
import {
  useMeetingTypes,
  useUpdateMeetingType,
  useDeleteMeetingType,
} from "@/hooks/meetingTypes";
import { CreateMeetingTypeDialog } from "@/components/meeting-types/CreateMeetingTypeDialog";
import { Switch } from "@/components/ui/switch";
import { ErrorMessage } from "@/components/ui/error-message";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash2, CalendarX } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/booking";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import type { components } from "@/api/generated/schema";

type MeetingType = components["schemas"]["MeetingType"];

export function AdminMeetingTypesPage() {
  const { user } = useAuth();
  const adminId = user?.id ?? "";

  const [deleteTarget, setDeleteTarget] = useState<MeetingType | null>(null);

  const {
    data: types,
    isLoading,
    isError,
    error,
  } = useMeetingTypes(adminId);
  const updateMutation = useUpdateMeetingType(adminId);
  const deleteMutation = useDeleteMeetingType(adminId);
  const updatingId = updateMutation.isPending
    ? updateMutation.variables?.id
    : null;
  const updatingField = updateMutation.isPending
    ? updateMutation.variables?.visible !== undefined
      ? "visible"
      : updateMutation.variables?.allowGuestInvite !== undefined
        ? "allowGuestInvite"
        : null
    : null;

  const items: MeetingType[] = Array.isArray(types) ? types : [];

  if (isLoading) {
    return <PageSkeleton rows={6} />;
  }

  if (isError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-zinc-900">
          Типы встреч
        </h1>
        <ErrorMessage
          message={error?.message ?? "Ошибка загрузки типов встреч"}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Типы встреч</h1>
        <CreateMeetingTypeDialog adminId={adminId} existingTypes={items} animated />
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16">
          <CalendarX className="h-12 w-12 text-zinc-300" />
          <p className="text-sm text-zinc-400">Нет типов встреч</p>
          <p className="text-xs text-zinc-300 animate-bounce">
            Нажмите «Создать» → в правом верхнем углу
          </p>
        </div>
      )}

      {deleteMutation.isError && (
        <div className="mb-4">
          <ErrorMessage
            message={deleteMutation.error?.message ?? "Ошибка при удалении"}
          />
        </div>
      )}

      {items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((type) => (
            <div
              key={type.id}
              className="rounded-lg border border-zinc-200 bg-white p-4"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <span className="text-lg font-semibold text-zinc-900">
                    {type.duration} мин
                  </span>
                  <span className="ml-2 rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {CATEGORY_LABELS[type.category]}
                  </span>
                </div>
                <button
                  className="text-zinc-400 hover:text-red-500 disabled:opacity-50"
                  disabled={deleteMutation.isPending}
                  onClick={() => setDeleteTarget(type)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Видимость</span>
                  <Switch
                    checked={type.visible}
                    onCheckedChange={(checked) =>
                      updateMutation.mutate({
                        id: type.id,
                        visible: checked,
                      })
                    }
                    disabled={
                      updateMutation.isPending &&
                      updatingId === type.id &&
                      updatingField === "visible"
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Гостевые инвайты</span>
                  <Switch
                    checked={type.allowGuestInvite}
                    onCheckedChange={(checked) =>
                      updateMutation.mutate({
                        id: type.id,
                        allowGuestInvite: checked,
                      })
                    }
                    disabled={
                      updateMutation.isPending &&
                      updatingId === type.id &&
                      updatingField === "allowGuestInvite"
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Удалить тип встречи?"
        description="Это действие нельзя отменить."
        confirmLabel="Удалить"
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
