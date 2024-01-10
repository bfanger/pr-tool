import type { Profile } from "./Profile";

type ReviewerIcon = "" | "APPROVED";
export type Reviewer = {
  profile: Profile;
  status: string;
  icon: ReviewerIcon;
  required: boolean;
};
export type PullRequestFase = "DRAFT" | "READY";

export type PullRequest = {
  id: string | number;
  title: string;
  fase: PullRequestFase;
  url: string;
  creator: Profile;
  reviewers: Reviewer[];
  // project: Project
};

// UI: (*) Relevant ( ) Active  ( ) All

// Relevant:
// - created-by me and new comments/status
// - created-by me and 2 reviewers approved (azure)
// - assigned to me and not approved (azure)
// - assigned to me and new comments/status/updates
//
// Active
// - created-by or assigned to me
//
// All
// - Every PR the api exposes
//
export type PullRequestStatus = {
  relevant: boolean;
  active: boolean;
  created: boolean;
  assigned: boolean;
};
