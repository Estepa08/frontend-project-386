import { useEffect, useMemo, useState } from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { ru } from "date-fns/locale";
import { format, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBooking } from "@/store/booking";
import { cn } from "@/lib/utils";
import { SLOT_DURATIONS, SLOT_DURATION_LABELS } from "@/lib/constants";
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

  useEffect(() => {
    if (!duration && enabledDurations.length > 0) {
      setDuration(enabledDurations[0]);
    }
  }, [enabledDurations, duration, setDuration]);

  const {
    data: datesData,
    isError: datesError,
  } = useAvailableDates(monthStr, duration ?? undefined);

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

  const showDurationPicker = enabledDurations.length > 1;

  return (
    <div data-container="step--date-time">
      {availabilityError && <ErrorMessage message="Не удалось загрузить настройки" />}
      {datesError && <ErrorMessage message="Не удалось загрузить доступные даты" />}
      {slotsError && <ErrorMessage message="Не удалось загрузить слоты" />}

      <div data-container="container--content" className="min-h-[450px]">
        {showDurationPicker && (
          <div className="mb-6 flex items-center gap-2" data-container="card--duration-picker">
            <span className="text-sm font-medium text-zinc-700">Длительность:</span>
            <div className="flex rounded-lg border border-zinc-200 bg-white p-1">
              {SLOT_DURATIONS.map((option) => {
                const enabled = enabledDurations.includes(option);
                const isSelected = duration === option;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={!enabled}
                    onClick={() => setDuration(option)}
                    className={cn(
                      "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:text-zinc-900",
                      !enabled && "cursor-not-allowed text-zinc-300",
                    )}
                  >
                    {SLOT_DURATION_LABELS[option]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
                  onNext={() => setStep(2)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
