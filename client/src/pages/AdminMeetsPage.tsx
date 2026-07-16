import { MeetsList } from "@/components/meets/MeetsList";

export function AdminMeetsPage() {
  return (
    <MeetsList
      title="Все встречи"
      role="admin"
      nameField="userName"
      nameColumnLabel="Клиент"
    />
  );
}
