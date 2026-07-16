import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMeets,
  fetchMeetById,
  cancelMeet,
  type MeetFilters,
  type MeetResult,
} from "@/api/meets";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { REFETCH_INTERVAL } from "@/lib/utils";

export function useMeets(
  role: "admin" | "user",
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

export function useCancelMeet(): UseMutationResult<MeetResult, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelMeet(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["meets"] });
      queryClient.invalidateQueries({ queryKey: ["meet", data.id] });
    },
  });
}
