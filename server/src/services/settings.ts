import { memoryStore } from "../lib/memory-store.js";

export const DEFAULT_SLOT_DURATIONS = ["15", "30"];
export type SlotDuration = "15" | "30";

const SETTINGS_ID = 1;

export async function getSlotDurations(): Promise<SlotDuration[]> {
  const settings = await memoryStore.settings.findUnique({ where: { id: SETTINGS_ID } });
  if (!settings) return [...DEFAULT_SLOT_DURATIONS] as SlotDuration[];
  return settings.slotDurations as SlotDuration[];
}

export async function setSlotDurations(slotDurations: SlotDuration[]): Promise<void> {
  await memoryStore.settings.deleteMany({ where: {} });
  await memoryStore.settings.create({
    data: { id: SETTINGS_ID, slotDurations: [...slotDurations] },
  });
}
