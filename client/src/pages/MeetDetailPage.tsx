import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, Copy, ArrowLeft, AlertCircle } from "lucide-react";
import { useMeet, useCancelMeet } from "@/hooks/meets";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorMessage } from "@/components/ui/error-message";
import { CLIPBOARD_FEEDBACK_DURATION } from "@/lib/utils";

export function MeetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const meetId = id ? Number(id) : undefined;
  const { data: meet, isLoading, isError, error } = useMeet(meetId);
  const cancelMutation = useCancelMeet();

  const handleCopyLink = async () => {
    if (!meet?.inviteLink) return;
    try {
      await navigator.clipboard.writeText(meet.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), CLIPBOARD_FEEDBACK_DURATION);
    } catch (clipboardError) {
      console.warn("Failed to copy invite link:", clipboardError);
    }
  };

  const handleCancel = () => {
    if (!meetId) return;
    cancelMutation.mutate(meetId);
  };

  if (isLoading) {
    return (
      <p className="py-10 text-center text-sm text-zinc-400">Загрузка...</p>
    );
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
    <div className="max-w-xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Назад
      </Button>

      <h1 className="mb-6 text-2xl font-bold text-zinc-900">{meet.theme}</h1>

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
            <code className="flex-1 truncate rounded bg-zinc-100 px-2 py-1 text-sm text-zinc-700">
              {meet.inviteLink}
            </code>
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
        <div className="mt-6">
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? "Отмена..." : "Отменить встречу"}
          </Button>

          {cancelMutation.isError && (
            <div className="mt-3">
              <ErrorMessage
                message={cancelMutation.error?.message ?? "Ошибка при отмене"}
              />
            </div>
          )}

          {cancelMutation.isSuccess && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Встреча отменена
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
    </div>
  );
}
