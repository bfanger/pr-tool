import { z } from "zod";

export type Status = "init" | "error" | "updating" | "idle";

export type Platform = {
  status: Status;
  stats: { active: number };
  refresh: () => Promise<void>;

  getActiveTodos: () => { status: Status; items: Todo[] };
};
export type Todo = {
  id: string;
  url: string;
  title: string;
  getAuthor(): { status: Status; author?: Person };
  // collaborator(): Person[];
};
type Person = {
  name: string;
  getAvatar: (size: "medium" | "large") => { status: Status; url?: string };
};

export type GitlabConfig = z.infer<typeof gitlabConfigSchema>;
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
