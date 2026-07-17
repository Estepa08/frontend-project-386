import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useUpdateMeet } from "@/hooks/meets";
import { Button, Input, Label } from "@/components/ui";
import type { Meet, MeetPatch } from "@/api/meets";

function joinEmails(emails: string[]): string {
  return emails.join(", ");
}

function splitEmails(raw: string): string[] {
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

interface MeetEditDialogProps {
  meet: Meet;
  open: boolean;
  onClose: () => void;
}

export function MeetEditDialog({ meet, open, onClose }: MeetEditDialogProps) {
  const updateMutation = useUpdateMeet();

  const [editTheme, setEditTheme] = useState(meet.theme);
  const [editComment, setEditComment] = useState(meet.comment ?? "");
  const [guestEmailInput, setGuestEmailInput] = useState(
    joinEmails(meet.guestEmails ?? []),
  );

  useEffect(() => {
    setEditTheme(meet.theme);
    setEditComment(meet.comment ?? "");
    setGuestEmailInput(joinEmails(meet.guestEmails ?? []));
  }, [meet]);

  if (!open) return null;

  const handleSave = async () => {
    const guestEmails = splitEmails(guestEmailInput);

    const body: MeetPatch = {};
    if (editTheme !== meet.theme) body.theme = editTheme;
    if (editComment !== (meet.comment ?? "")) body.comment = editComment || undefined;
    if (joinEmails(guestEmails) !== joinEmails(meet.guestEmails ?? [])) {
      body.guestEmails = guestEmails;
    }

    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: meet.id, body });
      toast.success("Встреча обновлена");
      onClose();
    } catch {
      toast.error("Ошибка при обновлении встречи");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      data-container="overlay--edit-meet"
    >
      <div
        className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        data-container="card--edit-meet"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Редактировать встречу</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="mb-1 block">Тема</Label>
            <Input
              type="text"
              value={editTheme}
              onChange={(e) => setEditTheme(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1 block">Комментарий</Label>
            <Input
              type="text"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="Необязательно"
            />
          </div>
          <div>
            <Label className="mb-1 block">Гости (email через запятую)</Label>
            <Input
              type="text"
              value={guestEmailInput}
              onChange={(e) => setGuestEmailInput(e.target.value)}
              placeholder="guest@example.com, friend@example.com"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
