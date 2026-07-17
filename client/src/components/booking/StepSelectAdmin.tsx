import { useBooking } from "@/store/booking";
import { useAdmins } from "@/hooks/booking";
import { ErrorMessage } from "@/components/ui/error-message";

export function StepSelectAdmin() {
  const { setAdmin } = useBooking();

  const { data: admins, isLoading, isError } = useAdmins();

  if (isLoading) {
    return <p className="py-10 text-center text-sm text-zinc-400">Загрузка...</p>;
  }

  if (isError) {
    return <ErrorMessage message="Не удалось загрузить список организаторов" />;
  }

  return (
    <div data-container="step--select-admin">
      <h2 className="mb-6 text-lg font-semibold text-zinc-900">
        Выберите организатора
      </h2>

      <div className="space-y-3" data-container="list--admins">
        {(admins ?? []).map((admin) => (
          <button
            key={admin.id}
            onClick={() => setAdmin(admin)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:border-zinc-400 hover:shadow-sm"
          >
            <p className="font-medium text-zinc-900">{admin.name}</p>
            <p className="mt-0.5 text-sm text-zinc-500">{admin.email}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
