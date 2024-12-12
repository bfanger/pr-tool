import type { ApiUser } from "./api-user";

type MergeRequest = {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  merged_by: ApiUser;
  merged_at: string;
  closed_by: null;
  closed_at: null;
  target_branch: string;
  source_branch: string;
  user_notes_count: number;
  upvotes: number;
  downvotes: number;
  assignee: ApiUser;
  author: ApiUser;
  assignees: ApiUser[];
  reviewers: ApiUser[];
  source_project_id: number;
  target_project_id: number;
  labels: [];
  work_in_progress: boolean;
  milestone: null;
  merge_when_pipeline_succeeds: boolean;
  merge_status: string;
  sha: string;
  merge_commit_sha: string;
  squash_commit_sha: null;
  discussion_locked: null;
  should_remove_source_branch: null;
  force_remove_source_branch: boolean;
  reference: string;
  references: {
    short: string;
    relative: string;
    full: string;
  };
  web_url: string;
  time_stats: {
    time_estimate: number;
    total_time_spent: number;
    human_time_estimate: null;
    human_total_time_spent: null;
  };
  squash: boolean;
  task_completion_status: {
    count: number;
    completed_count: number;
  };
  has_conflicts: boolean;
  blocking_discussions_resolved: boolean;
};

export type MergeRequestsResponse = MergeRequest[];

export type ApprovalsResponse = {
  user_has_approved: boolean;
  user_can_approve: boolean;
  approved: boolean;
  approved_by: { user: ApiUser }[];
};
