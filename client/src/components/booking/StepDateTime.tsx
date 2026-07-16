import { useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { ru } from "date-fns/locale";
import { format } from "date-fns";
import { useBooking } from "@/store/booking";
import { cn } from "@/lib/utils";
import { categoryLabel } from "@/lib/booking";
import { useMeetingTypes, useAvailableDates, useSlots } from "@/hooks/booking";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "@/components/ui/error-message";
import { StepNav } from "./StepNav";

export function StepDateTime() {
  const { admin, meetingType, date, slot, setMeetingType, setDate, setSlot, setStep } =
    useBooking();

  const month = date ?? new Date();
  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  const monthStr = format(month, "yyyy-MM");

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
          <Select
            value={meetingType ? String(meetingType.id) : ""}
            onValueChange={(val) => {
              const found = types.find((typeItem) => typeItem.id === Number(val));
              if (found) setMeetingType(found);
            }}
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              {types.map((typeItem) => (
                <SelectItem key={typeItem.id} value={String(typeItem.id)}>
                  {typeItem.duration} мин · {categoryLabel(typeItem.category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {datesError && <ErrorMessage message="Не удалось загрузить доступные даты" />}
      {slotsError && <ErrorMessage message="Не удалось загрузить слоты" />}
      {typesError && <ErrorMessage message="Не удалось загрузить типы встреч" />}

      {meetingType && (
        <div className="flex flex-col gap-6 md:flex-row">
          <DayPicker
            mode="single"
            selected={date ?? undefined}
            onSelect={(selectedDate) => setDate(selectedDate ?? null)}
            locale={ru}
            month={month}
            startMonth={new Date()}
            modifiers={{
              available: (day) => availableDatesSet.has(format(day, "yyyy-MM-dd")),
            }}
            modifiersStyles={{
              available: { fontWeight: 600 },
            }}
            disabled={(day) =>
              day < new Date(new Date().toDateString()) ||
              !availableDatesSet.has(format(day, "yyyy-MM-dd"))
            }
            showOutsideDays={false}
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
      )}
    </div>
  );
}
