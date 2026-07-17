import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMeets,
  fetchMeetById,
  cancelMeet,
  updateMeet,
  type MeetFilters,
  type MeetResult,
  type MeetPatch,
} from "@/api/meets";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { REFETCH_INTERVAL } from "@/lib/utils";
import { MEET_STATUS, type Role } from "@/lib/constants";

export function useMeets(
  role: Role,
  userId: string,
  filters?: MeetFilters,
): UseQueryResult<MeetResult[]> {
  return useQuery({
    queryKey: ["meets", role, userId, filters],
    queryFn: () => fetchMeets(role, userId, filters),
    enabled: !!role && !!userId,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useMeet(id?: number): UseQueryResult<MeetResult> {
  return useQuery({
    queryKey: ["meet", id],
    queryFn: () => fetchMeetById(id!),
    enabled: !!id,
  });
}

export function useUpdateMeet(): UseMutationResult<MeetResult, Error, { id: number; body: MeetPatch }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }) => updateMeet(id, body),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["meet", id] });
      queryClient.invalidateQueries({ queryKey: ["meets"] });
    },
  });
}

export function useCancelMeet(): UseMutationResult<MeetResult, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelMeet(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["meets"] });
      await queryClient.cancelQueries({ queryKey: ["meet", id] });

      const previousMeets = queryClient.getQueriesData<MeetResult[]>({ queryKey: ["meets"] });
      const previousMeet = queryClient.getQueryData<MeetResult>(["meet", id]);

      queryClient.setQueriesData<MeetResult[]>(
        { queryKey: ["meets"] },
        (old) => old?.map((m) => (m.id === id ? { ...m, status: MEET_STATUS.CANCELLED } : m)),
      );
      queryClient.setQueryData<MeetResult>(["meet", id], (old) =>
        old ? { ...old, status: MEET_STATUS.CANCELLED } : old,
      );

      return { previousMeets, previousMeet };
    },
    onError: (_err, id, context) => {
      if (context?.previousMeets) {
        for (const [key, data] of context.previousMeets) {
          queryClient.setQueryData(key, data);
        }
      }
      if (context?.previousMeet) {
        queryClient.setQueryData(["meet", id], context.previousMeet);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["meets"] });
      queryClient.invalidateQueries({ queryKey: ["meet"] });
    },
  });
}
