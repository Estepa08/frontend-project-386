import { useNavigate } from "react-router-dom";
import { CalendarDays, UserCog } from "lucide-react";
import { useRole } from "@/store/role";

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  container: string;
}

function RoleCard({ title, description, icon, onClick, container }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-container={container}
      className="group flex flex-col items-start gap-4 rounded-xl border border-zinc-200 bg-white p-6 text-left transition-colors hover:border-zinc-900"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
        {icon}
      </span>
      <span>
        <span className="block text-lg font-semibold text-zinc-900">{title}</span>
        <span className="mt-1 block text-sm text-zinc-500">{description}</span>
      </span>
    </button>
  );
}

export function LandingPage() {
  const setRole = useRole((state) => state.setRole);
  const navigate = useNavigate();

  const enterAsOwner = () => {
    setRole("owner");
    navigate("/admin");
  };

  const enterAsUser = () => {
    setRole("user");
    navigate("/booking");
  };

  return (
    <div className="mx-auto max-w-2xl" data-container="page--landing">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-zinc-900">Кто вы?</h1>
        <p className="mt-2 text-zinc-500">
          Выберите, как вы хотите пользоваться Meetly
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <RoleCard
          container="role-card--owner"
          title="Владелец"
          description="Управляйте графиком работы и списком встреч"
          icon={<UserCog className="h-6 w-6" />}
          onClick={enterAsOwner}
        />
        <RoleCard
          container="role-card--user"
          title="Пользователь"
          description="Забронируйте свободное время для встречи"
          icon={<CalendarDays className="h-6 w-6" />}
          onClick={enterAsUser}
        />
      </div>
    </div>
  );
}
