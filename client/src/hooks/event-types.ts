import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEventTypes,
  fetchEventType,
  createEventType,
  updateEventType,
  deleteEventType,
  type EventType,
  type EventTypeInput,
} from "@/api/event-types";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

export function useEventTypes(): UseQueryResult<EventType[]> {
  return useQuery({
    queryKey: ["event-types"],
    queryFn: fetchEventTypes,
  });
}

export function useEventType(id?: number): UseQueryResult<EventType> {
  return useQuery({
    queryKey: ["event-type", id],
    queryFn: () => fetchEventType(id!),
    enabled: !!id,
  });
}

export function useCreateEventType(): UseMutationResult<EventType, Error, EventTypeInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: EventTypeInput) => createEventType(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event-types"] }),
  });
}

export function useUpdateEventType(): UseMutationResult<
  EventType,
  Error,
  { id: number; body: EventTypeInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updateEventType(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event-types"] }),
  });
}

export function useDeleteEventType(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteEventType(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event-types"] }),
  });
}
