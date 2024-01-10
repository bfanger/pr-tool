import type { Profile } from "../Profile";

export interface GithubProfile extends Profile {
  id: string;
  name: string;
  avatar?: string;
}
