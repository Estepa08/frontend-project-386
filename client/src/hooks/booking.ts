import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchAdmins,
  fetchMeetingTypes,
  fetchAvailableDates,
  fetchSlots,
  createMeet,
  type CreateMeetBody,
} from "@/api/booking";

export function useAdmins() {
  return useQuery({
    queryKey: ["admins"],
    queryFn: fetchAdmins,
  });
}

export function useMeetingTypes(adminId?: string) {
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
) {
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
) {
  return useQuery({
    queryKey: ["slots", adminId, date, meetingTypeId],
    queryFn: () => fetchSlots(adminId!, date!, meetingTypeId),
    enabled: !!adminId && !!date,
  });
}

export function useCreateMeet() {
  return useMutation({
    mutationFn: (body: CreateMeetBody) => createMeet(body),
  });
}
