import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateTimelineItemRequest, type UpdateTimelineItemRequest } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useTimeline(projectId: number) {
  return useQuery({
    queryKey: [api.timeline.list.path, projectId],
    queryFn: async () => {
      const url = buildUrl(api.timeline.list.path, { projectId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch timeline");
      const data = await res.json();
      return parseWithLogging(api.timeline.list.responses[200], data, "timeline.list");
    },
    enabled: !!projectId,
  });
}

export function useCreateTimelineItem(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<CreateTimelineItemRequest, "projectId">) => {
      const url = buildUrl(api.timeline.create.path, { projectId });
      const res = await fetch(url, {
        method: api.timeline.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add to timeline");
      const json = await res.json();
      return parseWithLogging(api.timeline.create.responses[201], json, "timeline.create");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.timeline.list.path, projectId] }),
  });
}

export function useUpdateTimelineItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId, ...data }: UpdateTimelineItemRequest & { id: number, projectId: number }) => {
      const url = buildUrl(api.timeline.update.path, { id });
      const res = await fetch(url, {
        method: api.timeline.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update timeline item");
      const json = await res.json();
      return parseWithLogging(api.timeline.update.responses[200], json, "timeline.update");
    },
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: [api.timeline.list.path, variables.projectId] }),
  });
}

export function useDeleteTimelineItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: number, projectId: number }) => {
      const url = buildUrl(api.timeline.delete.path, { id });
      const res = await fetch(url, {
        method: api.timeline.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete timeline item");
    },
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: [api.timeline.list.path, variables.projectId] }),
  });
}
