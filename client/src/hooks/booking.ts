import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchAvailableDates,
  fetchSlots,
  createMeet,
  type MeetInput,
} from "@/api/booking";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { components } from "@/api/generated/schema";

export function useAvailableDates(
  month?: string,
): UseQueryResult<components["schemas"]["AvailableDates"]> {
  return useQuery({
    queryKey: ["available-dates", month],
    queryFn: () => fetchAvailableDates(month!),
    enabled: !!month,
  });
}

export function useSlots(
  date?: string,
): UseQueryResult<components["schemas"]["Slots"]> {
  return useQuery({
    queryKey: ["slots", date],
    queryFn: () => fetchSlots(date!),
    enabled: !!date,
  });
}

import type { MeetResult } from "@/api/booking";

export function useCreateMeet(): UseMutationResult<MeetResult, Error, MeetInput> {
  return useMutation({
    mutationFn: (body: MeetInput) => createMeet(body),
  });
}
