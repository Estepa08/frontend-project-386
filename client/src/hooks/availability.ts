import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAvailability,
  updateAvailability,
  type Availability,
} from "@/api/availability";

export function useAvailability(adminId: string) {
  return useQuery({
    queryKey: ["availability", adminId],
    queryFn: () => fetchAvailability(adminId),
    enabled: !!adminId,
  });
}

export function useUpdateAvailability(adminId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Availability) => updateAvailability(adminId, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["availability", adminId] }),
  });
}
