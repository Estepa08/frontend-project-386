import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAvailability,
  updateAvailability,
  type Availability,
} from "@/api/availability";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

export function useAvailability(adminId: string): UseQueryResult<Availability> {
  return useQuery({
    queryKey: ["availability", adminId],
    queryFn: () => fetchAvailability(adminId),
    enabled: !!adminId,
  });
}

export function useUpdateAvailability(adminId: string): UseMutationResult<Availability, Error, Availability> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Availability) => updateAvailability(adminId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["availability", adminId] }),
  });
}
