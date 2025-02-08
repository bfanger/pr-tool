import cache from "../services/cache";
import {
  gitlabGetAll,
  gitlabGet,
  gitlabMergeRequestToTask,
  type GitLabApprovals,
  type GitLabMergeRequest,
  type GitLabUser,
} from "./gitlab-api";
import type { GitLabConfig, Platform, Progress } from "./types";

export default function gitlab({ auth }: GitLabConfig): Platform {
  let progress: Progress = $state("init");
  let activeMergeRequests = $state(
    new Map<number, GitLabMergeRequest & { approvals?: GitLabApprovals }>(),
  );
  let user: GitLabUser | undefined = $state();
  let activeTasks = $derived(
    activeMergeRequests
      .values()
      .map((mr) => gitlabMergeRequestToTask(mr))
      .toArray(),
  );
  let tasksWithAttentionRequired = $derived(
    activeMergeRequests
      .values()
      .filter((mr) => isAttentionNeeded(mr, user))
      .map((mr) => gitlabMergeRequestToTask(mr))
      .toArray(),
  );

  let stats: Platform["stats"] = $derived({
    attentionRequired: tasksWithAttentionRequired.length,
  });

  const userKey = Symbol("user");
  let refreshController = new AbortController();
  const config = {
    auth,
    signal: refreshController.signal,
  };

  function getUser() {
    return cache(userKey, () => gitlabGet(`/user`, {}, config), {
      dedupe: 10,
      revalidate: 86400,
    });
  }

  const refresh: Platform["refresh"] = async () => {
    refreshController.abort("refresh");
    refreshController = new AbortController();
    config.signal = refreshController.signal;

    if (progress !== "init") {
      progress = "updating";
    }
    try {
      user = await getUser();

      const [reviewMrs, authoredMrs, assignedMrs] = await Promise.all([
        gitlabGetAll(
          `/merge_requests`,
          {
            searchParams: {
              scope: "all",
              reviewer_id: user.id,
              state: "opened",
            },
          },
          { ...config, delay: 0 },
        ),
        gitlabGetAll(
          `/merge_requests`,
          {
            searchParams: {
              scope: "all",
              author_id: user.id,
              state: "opened",
            },
          },
          { ...config, delay: 25 },
        ),
        gitlabGetAll(
          `/merge_requests`,
          {
            searchParams: {
              scope: "all",
              assignee_id: user.id,
              state: "opened",
            },
          },
          { ...config, delay: 50, jitter: 2 },
        ),
      ]);
      const mrsIncludingApprovals = [
        ...assignedMrs,
        ...(await Promise.all(
          [authoredMrs, reviewMrs].flat().map(async (mr, i) => {
            const approvals = await gitlabGet(
              "/projects/{projectId}/merge_requests/{iid}/approvals",
              {
                params: { projectId: mr.project_id, iid: mr.iid },
              },
              { ...config, delay: i * 75 },
            );
            return { ...mr, approvals };
          }),
        )),
      ];
      activeMergeRequests = new Map(
        mrsIncludingApprovals.map((mr) => [mr.id, mr]),
      );
      progress = "idle";
    } catch (error) {
      progress = "error";
      throw error;
    }
  };

  return {
    get progress() {
      return progress;
    },
    get stats() {
      return stats;
    },
    get activeTasks() {
      return activeTasks;
    },
    get tasksWithAttentionRequired() {
      return tasksWithAttentionRequired;
    },
    refresh,
  } satisfies Platform;
}

function isAttentionNeeded(
  mr: GitLabMergeRequest & { approvals?: GitLabApprovals },
  user: GitLabUser | undefined,
): boolean {
  if (!user || mr.draft) {
    return false;
  }
  if (mr.author.id === user.id) {
    if (mr.reviewers.length === 0) {
      return true; // No reviewers assigned
    }
    return mr.reviewers.length === mr.approvals?.approved_by.length; // Approved, ready to merge
  }
  if (mr.assignees.find((assignee) => assignee.id === user.id)) {
    return true; // Assigned
  }
  if (mr.reviewers.find((reviewer) => reviewer.id === user.id)) {
    if (
      mr.approvals?.approved_by.find((approval) => approval.user.id === user.id)
    ) {
      return false; // Already approved
    }
    return true; // Review requested
  }
  return false;
}
