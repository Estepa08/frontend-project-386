import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Copy, ArrowLeft, AlertCircle, Pencil, X } from "lucide-react";
import { useMeet, useCancelMeet, useUpdateMeet } from "@/hooks/meets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorMessage } from "@/components/ui/error-message";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { CLIPBOARD_FEEDBACK_DURATION } from "@/lib/utils";

export function MeetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const meetId = id ? Number(id) : undefined;
  const { data: meet, isLoading, isError, error } = useMeet(meetId);
  const cancelMutation = useCancelMeet();
  const updateMutation = useUpdateMeet();

  const [editTheme, setEditTheme] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editGuestEmails, setEditGuestEmails] = useState("");

  useEffect(() => {
    if (meet) {
      setEditTheme(meet.theme);
      setEditComment(meet.comment ?? "");
      setEditGuestEmails((meet.guestEmails ?? []).join(", "));
    }
  }, [meet]);

  useEffect(() => {
    if (cancelMutation.isSuccess) {
      toast.success("Встреча отменена");
    }
  }, [cancelMutation.isSuccess]);

  const handleCopyLink = async () => {
    if (!meet?.inviteLink) return;
    try {
      await navigator.clipboard.writeText(meet.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), CLIPBOARD_FEEDBACK_DURATION);
    } catch {
      console.warn("Failed to copy invite link");
    }
  };

  const handleCancelConfirm = () => {
    if (!meetId) return;
    cancelMutation.mutate(meetId);
    setShowCancelDialog(false);
  };

  const handleEditSave = async () => {
    if (!meetId || !meet) return;

    const guestEmails = editGuestEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    const body: { theme?: string; comment?: string; guestEmails?: string[] } = {};
    if (editTheme !== meet.theme) body.theme = editTheme;
    if (editComment !== (meet.comment ?? "")) body.comment = editComment || undefined;
    const prevEmails = (meet.guestEmails ?? []).join(",");
    if (guestEmails.join(",") !== prevEmails) body.guestEmails = guestEmails;

    if (Object.keys(body).length === 0) {
      setShowEditDialog(false);
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: meetId, body });
      toast.success("Встреча обновлена");
      setShowEditDialog(false);
    } catch {
      toast.error("Ошибка при обновлении встречи");
    }
  };

  if (isLoading) {
    return <PageSkeleton rows={4} />;
  }

  if (isError) {
    const is404 = error?.message?.includes("404");
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Назад
        </Button>
        <ErrorMessage
          message={is404 ? "Встреча не найдена" : (error?.message ?? "Ошибка загрузки")}
        />
      </div>
    );
  }

  if (!meet) return null;

  const startDate = new Date(meet.startTime);
  const endDate = new Date(meet.endTime);

  return (
    <div className="max-w-xl" data-container="page--meet-detail">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Назад
      </Button>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">{meet.theme}</h1>
        {meet.status === "confirmed" && (
          <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-1 h-4 w-4" />
            Редактировать
          </Button>
        )}
      </div>

      <div className="space-y-4 rounded-lg border border-zinc-200 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">Статус</span>
          <StatusBadge status={meet.status} />
        </div>

        <div className="h-px bg-zinc-100" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Дата</p>
            <p className="mt-0.5 text-sm text-zinc-900">
              {startDate.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Время</p>
            <p className="mt-0.5 text-sm text-zinc-900">
              {startDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
              {" – "}
              {endDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <div className="h-px bg-zinc-100" />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Администратор</p>
          <p className="mt-0.5 text-sm text-zinc-900">{meet.adminName ?? `ID ${meet.adminId}`}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Клиент</p>
          <p className="mt-0.5 text-sm text-zinc-900">{meet.userName ?? `ID ${meet.userId}`}</p>
        </div>

        {meet.comment && (
          <>
            <div className="h-px bg-zinc-100" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Комментарий</p>
              <p className="mt-0.5 text-sm text-zinc-600">{meet.comment}</p>
            </div>
          </>
        )}

        {meet.guestEmails && meet.guestEmails.length > 0 && (
          <>
            <div className="h-px bg-zinc-100" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Гости</p>
              <ul className="mt-0.5 space-y-0.5">
                {meet.guestEmails.map((email) => (
                  <li key={email} className="text-sm text-zinc-600">{email}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="h-px bg-zinc-100" />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Ссылка-приглашение</p>
          <div className="mt-1 flex items-center gap-2">
            <a
              href={meet.inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 truncate rounded bg-zinc-100 px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-200"
            >
              {meet.inviteLink}
            </a>
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {meet.status === "confirmed" && (
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setShowCancelDialog(true)}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? "Отмена..." : "Отменить встречу"}
          </Button>

          {cancelMutation.isError && (
            <div className="mt-3">
              <ErrorMessage message={cancelMutation.error?.message ?? "Ошибка при отмене"} />
            </div>
          )}
        </div>
      )}

      {meet.status !== "confirmed" && (
        <p className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
          <AlertCircle className="h-4 w-4" />
          Эта встреча была отменена
        </p>
      )}

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Отменить встречу?"
        description="Это действие нельзя отменить."
        confirmLabel="Отменить"
        onConfirm={handleCancelConfirm}
      />

      {showEditDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowEditDialog(false)}
        >
          <div
            className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Редактировать встречу</h2>
              <button
                onClick={() => setShowEditDialog(false)}
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
                  value={editGuestEmails}
                  onChange={(e) => setEditGuestEmails(e.target.value)}
                  placeholder="guest@example.com, friend@example.com"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Отмена
                </Button>
                <Button onClick={handleEditSave} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
