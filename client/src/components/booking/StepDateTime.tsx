import { useMemo, useState } from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { ru } from "date-fns/locale";
import { format, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useBooking } from "@/store/booking";
import { cn } from "@/lib/utils";
import { SLOT_DURATIONS } from "@/lib/constants";
import { useAvailableDates, useSlots } from "@/hooks/booking";
import { useAvailability } from "@/hooks/availability";
import { ErrorMessage } from "@/components/ui";
import { StepNav } from "./StepNav";

export function StepDateTime() {
  const { date, slot, duration, setDate, setSlot, setDuration, setStep } = useBooking();

  const [viewMonth, setViewMonth] = useState(new Date());
  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  const monthStr = format(viewMonth, "yyyy-MM");

  const { data: availability, isError: availabilityError } = useAvailability();
  const enabledDurations = availability?.slotDurations ?? [];
  const activeDuration = duration ?? enabledDurations[0];

  const {
    data: datesData,
    isError: datesError,
  } = useAvailableDates(monthStr, activeDuration);

  const {
    data: slotsData,
    isError: slotsError,
  } = useSlots(dateStr, duration ?? undefined);

  const availableDates = datesData?.dates ?? [];
  const slots = slotsData?.slots ?? [];

  const availableDatesSet = useMemo(
    () => new Set(availableDates),
    [availableDates],
  );

  return (
    <div data-container="step--date-time">
      {availabilityError && <ErrorMessage message="Не удалось загрузить настройки" />}
      {datesError && <ErrorMessage message="Не удалось загрузить доступные даты" />}
      {slotsError && <ErrorMessage message="Не удалось загрузить слоты" />}

      <div data-container="container--content" className="min-h-[450px]">
        <div
          className="mb-8 flex justify-center gap-3"
          data-container="card--duration-picker"
        >
          {SLOT_DURATIONS.map((option) => {
            const enabled = enabledDurations.includes(option);
            const isSelected = duration === option;
            return (
              <button
                key={option}
                type="button"
                disabled={!enabled}
                onClick={() => setDuration(option)}
                aria-pressed={isSelected}
                data-container={`duration-card--${option}`}
                className={cn(
                  "flex w-28 flex-col items-center gap-1 rounded-xl border px-4 py-3 transition-colors duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50",
                  !enabled && "cursor-not-allowed opacity-40",
                )}
              >
                <span className="text-2xl font-bold">{option}</span>
                <span className="text-xs">минут</span>
              </button>
            );
          })}
        </div>

        <div data-container="grid--calendar-and-slots" className="md:grid md:grid-cols-2 md:items-stretch md:gap-6">
          <div
            data-container="panel--calendar"
            className={cn(
              "transition-transform duration-300 ease-out motion-reduce:transition-none",
              duration ? "md:translate-x-0" : "md:translate-x-[calc(50%+0.75rem)]",
            )}
          >
            <div
              data-container="card--calendar"
              className="flex h-full min-h-[380px] w-full flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3"
            >
              <div data-container="header--calendar-month" className="flex items-center justify-between min-h-[36px]">
                <p className="capitalize text-sm font-semibold text-zinc-900">
                  {format(viewMonth, "LLLL yyyy", { locale: ru })}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMonth((m) => addMonths(m, -1))}
                    aria-label="Предыдущий месяц"
                    className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-600 transition-colors hover:text-zinc-900 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMonth((m) => addMonths(m, 1))}
                    aria-label="Следующий месяц"
                    className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-600 transition-colors hover:text-zinc-900 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
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
          </div>

          <div
            data-container="panel--slots"
            className={cn(
              "transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
              duration
                ? "md:translate-x-0 md:opacity-100"
                : "max-md:hidden md:invisible md:pointer-events-none md:translate-x-10 md:opacity-0",
            )}
          >
            <div
              data-container="card--slots"
              className="flex h-full min-h-[380px] max-h-[380px] w-full flex-col rounded-lg border border-zinc-200 bg-white p-3"
            >
              <div data-container="header--slots-title" className="flex items-center min-h-[36px]">
                <p className="truncate text-sm font-medium text-zinc-700">
                  {date
                    ? `Доступные слоты на ${format(date, "d MMMM, EEEE", { locale: ru })}`
                    : "Выберите дату"}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {!date && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-zinc-400">
                    <CalendarDays className="h-8 w-8" aria-hidden="true" />
                    <p className="text-sm">Выберите дату в календаре</p>
                  </div>
                )}

                {date && slots.length === 0 && (
                  <p className="text-sm text-zinc-400">Нет свободных слотов</p>
                )}

                {date && slots.length > 0 && (
                  <div data-container="grid--slots" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {slots.map((slotItem) => {
                      const isSelected = slot?.startTime === slotItem.startTime;
                      return (
                        <button
                          type="button"
                          key={slotItem.startTime}
                          onClick={() => setSlot(slotItem)}
                          className={cn(
                            "rounded-lg border px-3 py-2 text-sm transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
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
              </div>

              {slot && (
                <StepNav
                  onNext={() => setStep(2)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
