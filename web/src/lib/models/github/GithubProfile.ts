import type { Profile } from "../Profile";

export type GithubProfile = Profile & {
  id: string;
  name: string;
  avatar?: string;
};
