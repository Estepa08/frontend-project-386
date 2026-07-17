import { useState, useMemo } from "react";
import { Button, Label, ErrorMessage } from "@/components/ui";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui";
import { useCreateMeetingType } from "@/hooks/meetingTypes";
import type { components } from "@/api/generated/schema";
import { DURATIONS, CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";

type MeetingTypeInput = components["schemas"]["MeetingTypeInput"];
type MeetingType = components["schemas"]["MeetingType"];

interface CreateMeetingTypeDialogProps {
  adminId: string;
  existingTypes: MeetingType[];
}

export function CreateMeetingTypeDialog({ adminId, existingTypes }: CreateMeetingTypeDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<MeetingTypeInput>({
    duration: DURATIONS[0],
    category: CATEGORIES[0],
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
        setForm({ duration: DURATIONS[0], category: CATEGORIES[0] });
      },
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>Создать</Button>
      </DialogTrigger>
      <DialogContent data-container="dialog--create-meeting-type">
        <DialogHeader>
          <DialogTitle>Создать тип встречи</DialogTitle>
        </DialogHeader>

        <div className="space-y-4" data-container="form--meeting-type">
          {createMutation.isError && (
            <ErrorMessage
              message={createMutation.error?.message ?? "Ошибка при создании"}
            />
          )}

          <div>
            <Label className="mb-2 block">Длительность</Label>
            <div className="flex gap-4">
              {DURATIONS.map((dur) => (
                <label key={dur} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="duration"
                    checked={form.duration === dur}
                    onChange={() => setForm((f) => ({ ...f, duration: dur }))}
                  />
                  {dur} мин
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Категория</Label>
            <div className="flex gap-4">
              {CATEGORIES.map((category) => (
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
