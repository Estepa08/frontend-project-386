import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/store/auth";
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

interface MeetingType {
  id: number;
  duration: 15 | 30;
  category: "single" | "group" | "private";
  visible: boolean;
  allowGuestInvite: boolean;
}

const CATEGORY_LABEL: Record<string, string> = {
  single: "Single",
  group: "Group",
  private: "Private",
};

export function AdminMeetingTypesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ duration: 15 as 15 | 30, category: "single" as string });

  const { data: types, isLoading } = useQuery({
    queryKey: ["meeting-types"],
    queryFn: () =>
      fetch(`/api/admins/${user?.id}/meeting-types`).then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (body: { duration: number; category: string }) =>
      fetch(`/api/admins/${user?.id}/meeting-types`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-types"] });
      setDialogOpen(false);
      setForm({ duration: 15, category: "single" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/meeting-types/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-types"] });
    },
  });

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-zinc-400">Загрузка...</div>;
  }

  const items = (types as MeetingType[]) ?? [];

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
              <div>
                <Label className="mb-2 block">Длительность</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="duration"
                      checked={form.duration === 15}
                      onChange={() => setForm((f) => ({ ...f, duration: 15 }))}
                    />
                    15 мин
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="duration"
                      checked={form.duration === 30}
                      onChange={() => setForm((f) => ({ ...f, duration: 30 }))}
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
                        onChange={() => setForm((f) => ({ ...f, category: cat }))}
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
                  onClick={() => createMutation.mutate(form)}
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
        <p className="py-10 text-center text-sm text-zinc-400">
          Нет типов встреч. Создайте первый.
        </p>
      )}

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
                className="text-sm text-zinc-400 hover:text-red-500"
                onClick={() => deleteMutation.mutate(type.id)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Видимость</span>
                <Switch checked={type.visible} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Гостевые инвайты</span>
                <Switch checked={type.allowGuestInvite} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
