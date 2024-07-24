import type { ApiUser } from "../../services/gitlab-api-types/api-user";
import type { Profile } from "../Profile";

export interface GitlabProfile extends Profile {
  id: number;
  name: string;
  avatar?: string;
}
export function userToProfile(user: ApiUser): GitlabProfile {
  return {
    id: user.id,
    name: user.name,
    ...(user.avatar_url ? { avatar: user.avatar_url } : {}),
  };
}
