import { useMemo, useState } from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { ru } from "date-fns/locale";
import { format, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBooking } from "@/store/booking";
import { cn } from "@/lib/utils";
import { categoryLabel } from "@/lib/booking";
import { useMeetingTypes, useAvailableDates, useSlots } from "@/hooks/booking";
import { ErrorMessage } from "@/components/ui";
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
    <div data-container="step--date-time">
      <p className="mb-4 text-sm text-zinc-500">Организатор: {admin?.name}</p>

      {types && types.length > 0 && (
        <div data-container="card--meeting-types" className="mb-6">
          <p className="mb-1.5 text-sm font-medium text-zinc-700">Тип встречи</p>
          <div data-container="grid--meeting-types-choice" className="grid grid-cols-2 gap-3">
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

      <div data-container="container--content" className="min-h-[450px]">
        {meetingType ? (
          <div data-container="grid--calendar-and-slots" className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-6">
            <div data-container="card--calendar" className="bg-white border border-zinc-200 rounded-lg p-3 min-h-[250px] w-full flex flex-col gap-2">
              <div data-container="header--calendar-month" className="flex items-center justify-between min-h-[36px]">
                <p className="capitalize text-sm font-semibold text-zinc-900">
                  {format(viewMonth, "LLLL yyyy", { locale: ru })}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewMonth((m) => addMonths(m, -1))}
                    className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMonth((m) => addMonths(m, 1))}
                    className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

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
                  root: `${getDefaultClassNames().root} flex-1 flex flex-col justify-center`,
                  months: "w-full",
                  month_caption: "hidden",
                  nav: "hidden",
                  day: "p-0 rounded-lg overflow-hidden",
                  day_button:
                    "h-10 w-10 text-sm rounded-lg transition-colors " +
                    "hover:bg-zinc-100 " +
                    "aria-selected:bg-zinc-900 aria-selected:text-white aria-selected:hover:bg-zinc-800",
                  today: "bg-zinc-100 text-zinc-900 font-semibold rounded-lg",
                  disabled: "text-zinc-300 cursor-default line-through hover:bg-transparent",
                  outside: "text-zinc-200",
                  weekday: "text-xs font-medium text-zinc-900 uppercase pb-1 text-center",
                  month_grid: "w-full",
                }}
              />
            </div>

            {date && (
            <div data-container="card--slots" className="bg-white border border-zinc-200 rounded-lg p-3 w-full flex flex-col gap-2">
                <div data-container="header--slots-title" className="flex items-center min-h-[36px]">
                  <p className="text-sm font-medium text-zinc-700">
                    Доступные слоты на {format(date, "d MMMM, EEEE", { locale: ru })}
                  </p>
                </div>

              {slots.length === 0 && (
                  <p className="text-sm text-zinc-400">Нет свободных слотов</p>
                )}

                {slots.length > 0 && (
                  <div data-container="grid--slots" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
            )}
          </div>
        ) : (
          <div data-container="empty-state--select-type-first" className="flex items-center justify-center h-[450px] text-sm text-zinc-400">
            Сначала выберите тип встречи
          </div>
        )}
      </div>
    </div>
  );
}
