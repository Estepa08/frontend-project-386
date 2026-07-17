import { MeetsList } from "@/components/meets";
import { ROLES } from "@/lib/constants";

export function UserMeetsPage() {
  return (
    <MeetsList
      title="Мои встречи"
      role={ROLES.USER}
      nameField="adminName"
      nameColumnLabel="Администратор"
    />
  );
}
