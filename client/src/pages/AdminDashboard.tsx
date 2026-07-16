export function AdminDashboard() {
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const hours = Array.from({ length: 10 }, (_, i) => `${i + 8}:00`);

  const todayMeets = [
    { time: "14:00", name: "Иван П.", duration: "30 мин", type: "Консультация" },
    { time: "16:30", name: "Ольга К.", duration: "15 мин", type: "Знакомство" },
  ];

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900">Dashboard</h1>

        <div className="grid grid-cols-7 gap-px rounded-lg border border-zinc-200 bg-zinc-200 overflow-hidden">
          {weekDays.map((day) => (
            <div key={day} className="bg-white px-2 py-1.5 text-center text-xs font-medium text-zinc-500">
              {day}
            </div>
          ))}

          {hours.flatMap((hour) =>
            weekDays.map((_, dayIdx) => (
              <div
                key={`${hour}-${dayIdx}`}
                className="min-h-[48px] bg-white px-2 py-1 text-xs text-zinc-400 border-b border-zinc-100"
              >
                {dayIdx === 0 && (
                  <span className="block text-[10px] text-zinc-300">{hour}</span>
                )}
              </div>
            )),
          )}
        </div>

        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">Сегодняшние встречи</h2>
          <div className="space-y-2">
            {todayMeets.map((meet) => (
              <div
                key={meet.time}
                className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3"
              >
                <span className="text-sm font-medium text-zinc-900">{meet.time}</span>
                <span className="text-sm text-zinc-600">{meet.name}</span>
                <span className="text-xs text-zinc-400">{meet.duration}</span>
                <span className="ml-auto text-xs text-zinc-400">{meet.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="w-64 shrink-0">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700">Статистика</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Сегодня</span>
              <span className="font-medium text-zinc-900">3 встречи</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">На этой неделе</span>
              <span className="font-medium text-zinc-900">12 встреч</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700">Типы встреч</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">15 мин</span>
              <span className="text-zinc-900">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">30 мин</span>
              <span className="text-zinc-900">1</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
