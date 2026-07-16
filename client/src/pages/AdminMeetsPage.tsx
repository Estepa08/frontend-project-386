import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/store/auth";
import { Switch } from "@/components/ui/switch";

interface Meet {
  id: number;
  userId: string;
  theme: string;
  startTime: string;
  status: "confirmed" | "cancelled";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminMeetsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: meets, isLoading } = useQuery({
    queryKey: ["meets"],
    queryFn: () =>
      fetch(`/api/admins/${user?.id}/meets`).then((r) => r.json()),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      fetch(`/api/meets/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meets"] });
    },
  });

  const items = (meets as Meet[]) ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Все встречи</h1>

      {isLoading && (
        <p className="py-10 text-center text-sm text-zinc-400">Загрузка...</p>
      )}

      {!isLoading && items.length === 0 && (
        <p className="py-10 text-center text-sm text-zinc-400">Нет встреч</p>
      )}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Дата / время</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Клиент</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Тема</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Статус</th>
              </tr>
            </thead>
            <tbody>
              {items.map((meet) => (
                <tr key={meet.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 text-zinc-900">{formatDate(meet.startTime)}</td>
                  <td className="px-4 py-3 text-zinc-600">User #{meet.userId}</td>
                  <td className="px-4 py-3 text-zinc-600">{meet.theme}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={meet.status === "confirmed"}
                        onCheckedChange={(checked) =>
                          mutation.mutate({
                            id: meet.id,
                            status: checked ? "confirmed" : "cancelled",
                          })
                        }
                      />
                      <span
                        className={`text-xs font-medium ${
                          meet.status === "confirmed" ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {meet.status === "confirmed" ? "Подтверждено" : "Отменено"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
