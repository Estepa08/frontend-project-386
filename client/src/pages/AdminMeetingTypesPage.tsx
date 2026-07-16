import { useState } from "react";
import { useAuth } from "@/store/auth";
import {
  useMeetingTypes,
  useCreateMeetingType,
  useUpdateMeetingType,
  useDeleteMeetingType,
} from "@/hooks/meetingTypes";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ErrorMessage } from "@/components/ui/error-message";
import { Trash2 } from "lucide-react";
import type { MeetingType } from "@/api/meetingTypes";

const CATEGORY_LABEL: Record<string, string> = {
  single: "Single",
  group: "Group",
  private: "Private",
};

export function AdminMeetingTypesPage() {
  const { user } = useAuth();
  const adminId = user?.id ?? "";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    duration: 15 as 15 | 30,
    category: "single" as string,
  });

  const {
    data: types,
    isLoading,
    isError,
    error,
  } = useMeetingTypes(adminId);
  const createMutation = useCreateMeetingType(adminId);
  const updateMutation = useUpdateMeetingType(adminId);
  const deleteMutation = useDeleteMeetingType(adminId);

  const items = (types as MeetingType[]) ?? [];

  if (isLoading) {
    return (
      <div className="py-10 text-center text-sm text-zinc-400">
        Загрузка...
      </div>
    );
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Создать</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать тип встречи</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {createMutation.isError && (
                <ErrorMessage
                  message={
                    createMutation.error?.message ?? "Ошибка при создании"
                  }
                />
              )}

              <div>
                <Label className="mb-2 block">Длительность</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="duration"
                      checked={form.duration === 15}
                      onChange={() =>
                        setForm((f) => ({ ...f, duration: 15 }))
                      }
                    />
                    15 мин
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="duration"
                      checked={form.duration === 30}
                      onChange={() =>
                        setForm((f) => ({ ...f, duration: 30 }))
                      }
                    />
                    30 мин
                  </label>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Категория</Label>
                <div className="flex gap-4">
                  {["single", "group", "private"].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="category"
                        checked={form.category === cat}
                        onChange={() =>
                          setForm((f) => ({ ...f, category: cat }))
                        }
                      />
                      {CATEGORY_LABEL[cat]}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <DialogClose asChild>
                  <Button variant="outline">Отмена</Button>
                </DialogClose>
                <Button
                  onClick={() =>
                    createMutation.mutate(form, {
                      onSuccess: () => {
                        setDialogOpen(false);
                        setForm({ duration: 15, category: "single" });
                      },
                    })
                  }
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Создание..." : "Создать"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 && (
        <div className="py-10 text-center">
          <p className="mb-4 text-sm text-zinc-400">
            Нет типов встреч. Создайте первый.
          </p>
          <Button onClick={() => setDialogOpen(true)}>Создать</Button>
        </div>
      )}

      {deleteMutation.isError && (
        <div className="mb-4">
          <ErrorMessage
            message={
              deleteMutation.error?.message ?? "Ошибка при удалении"
            }
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
                    {CATEGORY_LABEL[type.category]}
                  </span>
                </div>
                <button
                  className="text-zinc-400 hover:text-red-500 disabled:opacity-50"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (window.confirm("Удалить тип встречи?")) {
                      deleteMutation.mutate(type.id);
                    }
                  }}
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
                    disabled={updateMutation.isPending}
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
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
