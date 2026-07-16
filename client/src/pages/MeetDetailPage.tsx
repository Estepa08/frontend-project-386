import { useParams } from "react-router-dom";

export function MeetDetailPage() {
  const { id } = useParams();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-zinc-900">Встреча #{id}</h1>
      <p className="text-zinc-500">Детали встречи.</p>
    </div>
  );
}
