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
  timestamp: number;
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

export type AzureDevOpsConfig = z.infer<typeof azureDevOpsConfigSchema>;
const azureDevOpsConfigSchema = z.object({
  type: z.literal("azure-devops"),
  auth: z.object({
    organization: z.string(),
    personalAccessToken: z.string(),
  }),
});

export type BitbucketConfig = z.infer<typeof bitbucketConfigSchema>;
const bitbucketConfigSchema = z.object({
  type: z.literal("bitbucket"),
  auth: z.object({
    domain: z.string(),
    personalAccessToken: z.string(),
    proxy: z.boolean(),
  }),
});
export type PlatformConfig = z.infer<typeof configsSchema>;
export const configsSchema = z
  .array(
    z
      .union([
        gitlabConfigSchema,
        githubConfigSchema,
        azureDevOpsConfigSchema,
        bitbucketConfigSchema,
      ])
      .optional()
      .catch((ctx) => {
        console.warn(ctx.error);
        return undefined;
      }),
  )
  .transform((configs) => configs.filter(Boolean))
  .catch((ctx) => {
    if (ctx.input !== null && ctx.input !== undefined) {
      console.warn(ctx.error);
    }
    return [];
  });
