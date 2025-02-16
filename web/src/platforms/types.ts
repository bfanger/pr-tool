import { z } from "zod";

export type Progress = "init" | "error" | "refreshing" | "updating" | "idle";

export type Platform = {
  progress: Progress;
  refresh: () => Promise<void>;
  abort: () => void;
  tasks: Task[];
};

export type Task = {
  id: string;
  url: string;
  title: string;
  attentionNeeded: boolean;
  author: Person;
  getGroup(): string | undefined;
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

export type GitHubConfig = z.infer<typeof githubConfigSchema>;
const githubConfigSchema = z.object({
  type: z.literal("github"),
  auth: z.object({
    login: z.string(),
    accessToken: z.string(),
  }),
});

export type PlatformConfig = GitLabConfig | GitHubConfig;
export const configsSchema = z
  .array(
    z
      .union([gitlabConfigSchema, githubConfigSchema])
      .optional()
      .catch((ctx) => {
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
