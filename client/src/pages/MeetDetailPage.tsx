import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Copy, ArrowLeft, AlertCircle, Pencil } from "lucide-react";
import { useMeet, useCancelMeet } from "@/hooks/meets";
import { ApiRequestError } from "@/api/client";
import { formatLocalDate, formatLocalTime, CLIPBOARD_FEEDBACK_DURATION } from "@/lib/utils";
import { Button, StatusBadge, ErrorMessage, ConfirmDialog, PageSkeleton } from "@/components/ui";
import { MeetEditDialog } from "@/components/meets";

export function MeetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const meetId = id ? Number(id) : undefined;
  const { data: meet, isLoading, isError, error } = useMeet(meetId);
  const cancelMutation = useCancelMeet();

  useEffect(() => {
    if (cancelMutation.isSuccess) {
      toast.success("Встреча отменена");
    }
  }, [cancelMutation.isSuccess]);

  useEffect(() => {
    if (cancelMutation.isError) {
      toast.error(cancelMutation.error?.message ?? "Ошибка при отмене встречи");
    }
  }, [cancelMutation.isError]);

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

  if (isLoading) {
    return <PageSkeleton rows={4} />;
  }

  if (isError) {
    const is404 = error instanceof ApiRequestError && error.code === "NOT_FOUND";
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
            <p className="mt-0.5 text-sm text-zinc-900">{formatLocalDate(startDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Время</p>
            <p className="mt-0.5 text-sm text-zinc-900">
              {formatLocalTime(startDate)}
              {" – "}
              {formatLocalTime(endDate)}
            </p>
          </div>
        </div>

        <div className="h-px bg-zinc-100" />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Администратор</p>
          <p className="mt-0.5 text-sm text-zinc-900">{meet.admin?.name ?? `ID ${meet.adminId}`}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Клиент</p>
          <p className="mt-0.5 text-sm text-zinc-900">{meet.user?.name ?? `ID ${meet.userId}`}</p>
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

      {meet && (
        <MeetEditDialog
          meet={meet}
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
        />
      )}
    </div>
  );
}
