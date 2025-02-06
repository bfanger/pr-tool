import { z } from "zod";

export type Progress = "init" | "error" | "updating" | "idle";

export type Platform = {
  progress: Progress;
  stats: { attentionRequired: number };
  refresh: () => Promise<void>;

  activeTasks: Task[];
  tasksWithAttentionRequired: Task[];
};
export type Task = {
  id: string;
  url: string;
  title: string;
  author: Person;
  getCollaborators: () => Collaborator[];
};
export type Person = {
  name: string;
  getAvatar: (size: "medium" | "large") => string | undefined;
};
export type Collaborator = Person & {
  icon?: "completed";
  status?: string;
};

export type GitLabConfig = z.infer<typeof gitlabConfigSchema>;
const gitlabConfigSchema = z.object({
  type: z.literal("gitlab"),
  auth: z.object({
    domain: z.string(),
    privateToken: z.string(),
  }),
});

export const configsSchema = z
  .array(
    gitlabConfigSchema.optional().catch((ctx) => {
      console.warn(ctx.error);
      return undefined;
    }),
  )
  .transform((configs) => configs.filter(Boolean))
  .catch((ctx) => {
    if (ctx.input !== null) {
      console.warn(ctx.error);
    }
    return [];
  });
