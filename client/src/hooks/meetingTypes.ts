import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/meetingTypes";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

export function useMeetingTypes(adminId: string): UseQueryResult<api.MeetingType[]> {
  return useQuery({
    queryKey: ["meeting-types", adminId],
    queryFn: () => api.fetchMeetingTypes(adminId),
    enabled: !!adminId,
  });
}

export function useCreateMeetingType(adminId: string): UseMutationResult<api.MeetingType, Error, api.MeetingTypeInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: api.MeetingTypeInput) =>
      api.createMeetingType(adminId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["meeting-types", adminId] }),
  });
}

export function useUpdateMeetingType(adminId: string): UseMutationResult<
  api.MeetingType,
  Error,
  { id: number } & Partial<api.MeetingType>
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: { id: number } & Partial<api.MeetingType>) =>
      api.updateMeetingType(id, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["meeting-types", adminId] }),
    onError: () =>
      queryClient.invalidateQueries({ queryKey: ["meeting-types", adminId] }),
  });
}

export function useDeleteMeetingType(adminId: string): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteMeetingType(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["meeting-types", adminId] }),
  });
}
