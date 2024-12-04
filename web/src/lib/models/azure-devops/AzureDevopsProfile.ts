import type {
  CreatedBy,
  Reviewer,
} from "../../services/azure-api-types/pull-requests-response";
import type { Profile } from "../Profile";

export interface AzureDevopsProfile extends Profile {
  id: string; // uniqueName / email
  name: string;
  descriptor?: string;
}

export function fromCreatedBy(createdBy: CreatedBy): AzureDevopsProfile {
  return {
    id: createdBy.uniqueName.toLowerCase(),
    name: createdBy.displayName,
    descriptor: createdBy.descriptor,
  };
}
export function fromReviewer(reviewer: Reviewer): AzureDevopsProfile {
  const match = reviewer._links.avatar.href.match(/MemberAvatars\/([^/]+)/);
  return {
    id: reviewer.uniqueName.toLowerCase(),
    name: reviewer.displayName,
    ...(match ? { descriptor: match[1] } : {}),
  };
}

//     avatar(size: string) {
//         if (this.descriptor) {
//             return getAvatar(this.descriptor, this.provider, size)
//         } else {
//             return this.provider.users$.pipe(
//                 switchMap((users) => {
//                     const user = users[this.id]
//                     if (user) {
//                         return getAvatar(user.descriptor, this.provider, size)
//                     }
//                     return never()
//                 }),
//             )
//         }
//     }
