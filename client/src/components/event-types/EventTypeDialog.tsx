import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateEventType, useUpdateEventType } from "@/hooks/event-types";
import { Button, Input, Label, ErrorMessage } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui";
import type { EventType } from "@/api/event-types";

const eventTypeFormSchema = z.object({
  title: z.string().min(1, "Укажите название"),
  description: z.string(),
  durationMinutes: z
    .string()
    .regex(/^\d+$/, "Длительность — целое число минут")
    .refine((value) => {
      const minutes = Number(value);
      return minutes >= 15 && minutes <= 480;
    }, "Длительность — от 15 до 480 минут"),
});

interface EventTypeDialogProps {
  eventType?: EventType | null;
  open: boolean;
  onClose: () => void;
}

export function EventTypeDialog({ eventType, open, onClose }: EventTypeDialogProps) {
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(eventType?.title ?? "");
    setDescription(eventType?.description ?? "");
    setDurationMinutes(eventType ? String(eventType.durationMinutes) : "30");
    setFormError(null);
  }, [open, eventType]);

  if (!open) return null;

  const handleSave = async () => {
    const parsed = eventTypeFormSchema.safeParse({ title, description, durationMinutes });
    if (!parsed.success) {
      setFormError(parsed.error.errors[0].message);
      return;
    }
    setFormError(null);

    const body = {
      title: parsed.data.title,
      description: parsed.data.description,
      durationMinutes: Number(parsed.data.durationMinutes),
    };

    try {
      if (eventType) {
        await updateMutation.mutateAsync({ id: eventType.id, body });
        toast.success("Тип события обновлён");
      } else {
        await createMutation.mutateAsync(body);
        toast.success("Тип события создан");
      }
      onClose();
    } catch {
      toast.error("Ошибка при сохранении типа события");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent data-container="card--event-type-form">
        <DialogHeader>
          <DialogTitle>{eventType ? "Редактировать тип события" : "Новый тип события"}</DialogTitle>
          <DialogDescription>
            Название, описание и длительность встречи в минутах.
          </DialogDescription>
        </DialogHeader>

        {formError && <ErrorMessage message={formError} />}

        <div className="space-y-4">
          <div>
            <Label className="mb-1 block">Название</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Консультация"
            />
          </div>

          <div>
            <Label className="mb-1 block">Описание</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="О чём будет встреча"
            />
          </div>

          <div>
            <Label className="mb-1 block">Длительность, минут</Label>
            <Input
              type="number"
              min={15}
              max={480}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
