import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMeets,
  fetchMeetById,
  cancelMeet,
  type MeetFilters,
} from "@/api/meets";

export function useMeets(
  role: "admin" | "user",
  userId: string,
  filters?: MeetFilters,
) {
  return useQuery({
    queryKey: ["meets", role, userId, filters],
    queryFn: () => fetchMeets(role, userId, filters),
    enabled: !!role && !!userId,
    refetchInterval: 30_000,
  });
}

export function useMeet(id?: number) {
  return useQuery({
    queryKey: ["meet", id],
    queryFn: () => fetchMeetById(id!),
    enabled: !!id,
  });
}

export function useCancelMeet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelMeet(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["meets"] });
      queryClient.invalidateQueries({ queryKey: ["meet", data.id] });
    },
  });
}
