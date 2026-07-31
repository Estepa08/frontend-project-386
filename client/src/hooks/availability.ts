import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAvailability,
  updateAvailability,
  type Availability,
} from "@/api/availability";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

export function useAvailability(): UseQueryResult<Availability> {
  return useQuery({
    queryKey: ["availability"],
    queryFn: fetchAvailability,
  });
}

export function useUpdateAvailability(): UseMutationResult<Availability, Error, Availability> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Availability) => updateAvailability(body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["availability"] }),
  });
}
