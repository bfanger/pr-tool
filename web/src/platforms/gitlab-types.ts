export type GitlabUser = {
  id: number;
  name: string;
  avatar_url: string;
} & { [key: string]: unknown };

export type GitlabMergeRequest = {
  id: number;
  project_id: number;
  iid: number;
  draft: boolean;
  title: string;
  author: GitlabUser;
  assignees: GitlabUser[];
  reviewers: GitlabUser[];
  web_url: string;
  updated_at: string;
} & { [key: string]: unknown };

export type GitlabGetRequests = {
  "/user": GitlabUser;
  "/merge_requests": any;
};
