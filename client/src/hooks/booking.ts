import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchAvailableDates,
  fetchSlots,
  createMeet,
  type MeetInput,
} from "@/api/booking";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { components } from "@/api/generated/schema";
import type { SlotDuration } from "@/lib/constants";

export function useAvailableDates(
  month?: string,
  duration?: SlotDuration,
): UseQueryResult<components["schemas"]["AvailableDates"]> {
  return useQuery({
    queryKey: ["available-dates", month, duration],
    queryFn: () => fetchAvailableDates(month!, duration!),
    enabled: !!month && !!duration,
  });
}

export function useSlots(
  date?: string,
  duration?: SlotDuration,
): UseQueryResult<components["schemas"]["Slots"]> {
  return useQuery({
    queryKey: ["slots", date, duration],
    queryFn: () => fetchSlots(date!, duration!),
    enabled: !!date && !!duration,
  });
}

import type { MeetResult } from "@/api/booking";

export function useCreateMeet(): UseMutationResult<MeetResult, Error, MeetInput> {
  return useMutation({
    mutationFn: (body: MeetInput) => createMeet(body),
  });
}
