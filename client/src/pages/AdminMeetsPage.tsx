import { MeetsList } from "@/components/meets";
import { ROLES } from "@/lib/constants";

export function AdminMeetsPage() {
  return (
    <MeetsList
      title="Все встречи"
      role={ROLES.ADMIN}
      nameField="userName"
      nameColumnLabel="Клиент"
    />
  );
}
