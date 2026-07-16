import { MeetsList } from "@/components/meets/MeetsList";

export function UserMeetsPage() {
  return (
    <MeetsList
      title="Мои встречи"
      role="user"
      nameField="adminName"
      nameColumnLabel="Администратор"
    />
  );
}
