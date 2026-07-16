import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/meetingTypes";

export function useMeetingTypes(adminId: string) {
  return useQuery({
    queryKey: ["meeting-types", adminId],
    queryFn: () => api.fetchMeetingTypes(adminId),
    enabled: !!adminId,
  });
}

export function useCreateMeetingType(adminId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: api.MeetingTypeInput) =>
      api.createMeetingType(adminId, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["meeting-types", adminId] }),
  });
}

export function useUpdateMeetingType(adminId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: { id: number } & Partial<api.MeetingType>) =>
      api.updateMeetingType(id, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["meeting-types", adminId] }),
    onError: () =>
      qc.invalidateQueries({ queryKey: ["meeting-types", adminId] }),
  });
}

export function useDeleteMeetingType(adminId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteMeetingType(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["meeting-types", adminId] }),
  });
}
