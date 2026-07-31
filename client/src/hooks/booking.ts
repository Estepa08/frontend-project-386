import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchAvailableDates, fetchSlots } from "@/api/event-types";
import { createMeet, type MeetInput } from "@/api/booking";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { components } from "@/api/generated/schema";
import type { MeetResult } from "@/api/booking";

export function useAvailableDates(
  eventTypeId?: number,
): UseQueryResult<components["schemas"]["AvailableDates"]> {
  return useQuery({
    queryKey: ["available-dates", eventTypeId],
    queryFn: () => fetchAvailableDates(eventTypeId!),
    enabled: !!eventTypeId,
  });
}

export function useSlots(
  eventTypeId?: number,
  date?: string,
): UseQueryResult<components["schemas"]["Slots"]> {
  return useQuery({
    queryKey: ["slots", eventTypeId, date],
    queryFn: () => fetchSlots(eventTypeId!, date!),
    enabled: !!eventTypeId && !!date,
  });
}

export function useCreateMeet(): UseMutationResult<MeetResult, Error, MeetInput> {
  return useMutation({
    mutationFn: (body: MeetInput) => createMeet(body),
  });
}
