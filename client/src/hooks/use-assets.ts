import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateAssetRequest } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useAssets(projectId: number) {
  return useQuery({
    queryKey: [api.assets.list.path, projectId],
    queryFn: async () => {
      const url = buildUrl(api.assets.list.path, { projectId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch assets");
      const data = await res.json();
      return parseWithLogging(api.assets.list.responses[200], data, "assets.list");
    },
    enabled: !!projectId,
  });
}

export function useCreateAsset(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<CreateAssetRequest, "projectId">) => {
      const url = buildUrl(api.assets.create.path, { projectId });
      const res = await fetch(url, {
        method: api.assets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create asset");
      const json = await res.json();
      return parseWithLogging(api.assets.create.responses[201], json, "assets.create");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.assets.list.path, projectId] }),
  });
}
