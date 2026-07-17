import { useMemo, useState } from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { ru } from "date-fns/locale";
import { format } from "date-fns";
import { useBooking } from "@/store/booking";
import { cn } from "@/lib/utils";
import { categoryLabel } from "@/lib/booking";
import { useMeetingTypes, useAvailableDates, useSlots } from "@/hooks/booking";
import { ErrorMessage } from "@/components/ui/error-message";
import { StepNav } from "./StepNav";

export function StepDateTime() {
  const { admin, meetingType, date, slot, setMeetingType, setDate, setSlot, setStep } =
    useBooking();

  const [viewMonth, setViewMonth] = useState(new Date());
  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  const monthStr = format(viewMonth, "yyyy-MM");

  const {
    data: types,
    isError: typesError,
  } = useMeetingTypes(admin?.id);

  const {
    data: datesData,
    isError: datesError,
  } = useAvailableDates(admin?.id, meetingType?.id, monthStr);

  const {
    data: slotsData,
    isError: slotsError,
  } = useSlots(admin?.id, meetingType?.id, dateStr);

  const availableDates = datesData?.dates ?? [];
  const slots = slotsData?.slots ?? [];

  const availableDatesSet = useMemo(
    () => new Set(availableDates),
    [availableDates],
  );

  return (
    <div>
      <p className="mb-4 text-sm text-zinc-500">Организатор: {admin?.name}</p>

      {types && types.length > 0 && (
        <div className="mb-6">
          <p className="mb-1.5 text-sm font-medium text-zinc-700">Тип встречи</p>
          <div className="grid grid-cols-2 gap-3">
            {types.map((typeItem) => {
              const isSelected = meetingType?.id === typeItem.id;
              return (
                <button
                  key={typeItem.id}
                  onClick={() => setMeetingType(typeItem)}
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left transition-colors",
                    isSelected
                      ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900"
                      : "border-zinc-200 bg-white hover:border-zinc-300",
                  )}
                >
                  <p className="text-sm font-medium text-zinc-900">{typeItem.duration} мин</p>
                  <p className="text-xs text-zinc-500">{categoryLabel(typeItem.category)}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {datesError && <ErrorMessage message="Не удалось загрузить доступные даты" />}
      {slotsError && <ErrorMessage message="Не удалось загрузить слоты" />}
      {typesError && <ErrorMessage message="Не удалось загрузить типы встреч" />}

      <div className="min-h-[450px]">
        {meetingType ? (
          <div className="flex flex-col gap-6 md:flex-row">
            <DayPicker
              mode="single"
              selected={date ?? undefined}
              onSelect={(selectedDate) => setDate(selectedDate ?? null)}
              locale={ru}
              month={viewMonth}
              onMonthChange={setViewMonth}
              startMonth={new Date()}
              modifiers={{
                available: (day) => availableDatesSet.has(format(day, "yyyy-MM-dd")),
              }}
              modifiersClassNames={{
                available: "font-semibold",
              }}
              disabled={(day) =>
                day < new Date(new Date().toDateString()) ||
                !availableDatesSet.has(format(day, "yyyy-MM-dd"))
              }
              showOutsideDays={false}
              classNames={{
                root: `${getDefaultClassNames().root} bg-white`,
                months: "flex justify-center",
                month_caption: "capitalize text-base font-semibold text-zinc-900 mb-2",
                nav: "relative",
                day: "p-0 rounded-lg overflow-hidden",
                day_button:
                  "h-12 w-12 text-base rounded-lg transition-colors " +
                  "hover:bg-zinc-100 " +
                  "aria-selected:bg-zinc-900 aria-selected:text-white aria-selected:hover:bg-zinc-800",
                disabled: "text-zinc-300 cursor-default line-through hover:bg-transparent",
                outside: "text-zinc-200",
                chevron: "fill-zinc-600",
                weekday: "text-xs text-zinc-400 font-normal pb-1",
                button_previous:
                  "absolute top-1/2 -translate-y-1/2 left-0 h-9 w-9 p-1 text-zinc-600 hover:text-zinc-900 transition-colors",
                button_next:
                  "absolute top-1/2 -translate-y-1/2 right-0 h-9 w-9 p-1 text-zinc-600 hover:text-zinc-900 transition-colors",
              }}
            />

            <div className="flex-1">
              {date && (
                <p className="mb-3 text-sm font-medium text-zinc-700">
                  Доступные слоты на {format(date, "d MMMM, EEEE", { locale: ru })}
                </p>
              )}

              {date && slots.length === 0 && (
                <p className="text-sm text-zinc-400">Нет свободных слотов</p>
              )}

              {slots.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {slots.map((slotItem) => {
                    const isSelected = slot?.startTime === slotItem.startTime;
                    return (
                      <button
                        key={slotItem.startTime}
                        onClick={() => setSlot(slotItem)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-sm transition-colors",
                          isSelected
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400",
                        )}
                      >
                        {slotItem.startTime.slice(0, 5)}
                      </button>
                    );
                  })}
                </div>
              )}

              {slot && (
                <StepNav
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[450px] text-sm text-zinc-400">
            Сначала выберите тип встречи
          </div>
        )}
      </div>
    </div>
  );
}
