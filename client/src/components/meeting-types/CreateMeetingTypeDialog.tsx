import { useState, useMemo } from "react";
import { CATEGORY_LABELS } from "@/lib/booking";
import { Button } from "@/components/ui/button";
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
import { useCreateMeetingType } from "@/hooks/meetingTypes";
import type { components } from "@/api/generated/schema";

type MeetingTypeInput = components["schemas"]["MeetingTypeInput"];
type MeetingType = components["schemas"]["MeetingType"];

interface CreateMeetingTypeDialogProps {
  adminId: string;
  existingTypes: MeetingType[];
  animated?: boolean;
}

export function CreateMeetingTypeDialog({ adminId, existingTypes, animated }: CreateMeetingTypeDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<MeetingTypeInput>({
    duration: 15,
    category: "single",
  });

  const isDuplicate = useMemo(
    () => existingTypes.some((t) => t.duration === form.duration && t.category === form.category),
    [existingTypes, form.duration, form.category],
  );

  const createMutation = useCreateMeetingType(adminId);

  const handleCreate = () => {
    createMutation.mutate(form, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm({ duration: 15, category: "single" });
      },
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className={animated ? "animate-pulse" : undefined}>Создать</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать тип встречи</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {createMutation.isError && (
            <ErrorMessage
              message={createMutation.error?.message ?? "Ошибка при создании"}
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
              {(["single", "group", "private"] as const).map((category) => (
                <label key={category} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="category"
                    checked={form.category === category}
                    onChange={() => setForm((f) => ({ ...f, category }))}
                  />
                  {CATEGORY_LABELS[category]}
                </label>
              ))}
            </div>
          </div>

          {isDuplicate && (
            <p className="text-xs text-amber-600">
              Такой тип встречи уже существует
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || isDuplicate}
            >
              {createMutation.isPending ? "Создание..." : "Создать"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
