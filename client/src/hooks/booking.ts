import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchAdmins,
  fetchMeetingTypes,
  fetchAvailableDates,
  fetchSlots,
  createMeet,
  type MeetInput,
} from "@/api/booking";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { components } from "@/api/generated/schema";

type Admin = components["schemas"]["Admin"];
type MeetingType = components["schemas"]["MeetingType"];

export function useAdmins(): UseQueryResult<Admin[]> {
  return useQuery({
    queryKey: ["admins"],
    queryFn: fetchAdmins,
  });
}

export function useMeetingTypes(adminId?: string): UseQueryResult<MeetingType[]> {
  return useQuery({
    queryKey: ["meeting-types", adminId],
    queryFn: () => fetchMeetingTypes(adminId!),
    enabled: !!adminId,
  });
}

export function useAvailableDates(
  adminId?: string,
  meetingTypeId?: number,
  month?: string,
): UseQueryResult<components["schemas"]["AvailableDates"]> {
  return useQuery({
    queryKey: ["available-dates", adminId, meetingTypeId, month],
    queryFn: () => fetchAvailableDates(adminId!, month!, meetingTypeId),
    enabled: !!adminId && !!month,
  });
}

export function useSlots(
  adminId?: string,
  meetingTypeId?: number,
  date?: string,
): UseQueryResult<components["schemas"]["Slots"]> {
  return useQuery({
    queryKey: ["slots", adminId, date, meetingTypeId],
    queryFn: () => fetchSlots(adminId!, date!, meetingTypeId),
    enabled: !!adminId && !!date,
  });
}

import type { MeetResult } from "@/api/booking";

export function useCreateMeet(): UseMutationResult<MeetResult, Error, MeetInput> {
  return useMutation({
    mutationFn: (body: MeetInput) => createMeet(body),
  });
}
