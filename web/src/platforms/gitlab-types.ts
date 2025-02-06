export type GitLabUser = {
  id: number;
  name: string;
  avatar_url: string;
} & { [key: string]: unknown };

export type GitLabMergeRequest = {
  id: number;
  project_id: number;
  iid: number;
  draft: boolean;
  title: string;
  author: GitLabUser;
  assignees: GitLabUser[];
  reviewers: GitLabUser[];
  web_url: string;
  updated_at: string;
} & { [key: string]: unknown };

export type GitLabApprovals = {
  approved_by: { user: GitLabUser }[];
};

export type GitLabGetRequests = {
  "/user": GitLabUser;
  "/merge_requests": GitLabMergeRequest[];
  "/projects/{projectId}/merge_requests/{iid}/approvals": GitLabApprovals;
};
