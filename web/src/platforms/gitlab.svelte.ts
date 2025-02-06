import buildUrl, { type PathParams } from "../services/buildUrl";
import cache from "../services/cache";
import type {
  GitLabApprovals,
  GitLabGetRequests,
  GitLabMergeRequest,
  GitLabUser,
} from "./gitlab-types";
import type {
  Collaborator,
  GitLabConfig,
  Platform,
  Progress,
  Task,
} from "./types";

export default function gitlab(config: GitLabConfig): Platform {
  let progress: Progress = $state("init");
  let activeMergeRequests = $state(
    new Map<number, GitLabMergeRequest & { approvals?: GitLabApprovals }>(),
  );
  let user: GitLabUser | undefined = $state();
  let activeTasks = $derived(
    activeMergeRequests
      .values()
      .map((mr) => mergeRequestToTask(mr))
      .toArray(),
  );
  let tasksWithAttentionRequired = $derived(
    activeMergeRequests
      .values()
      .filter((mr) => isAttentionNeeded(mr, user))
      .map((mr) => mergeRequestToTask(mr))
      .toArray(),
  );

  let stats: Platform["stats"] = $derived({
    attentionRequired: tasksWithAttentionRequired.length,
  });

  const userKey = Symbol("user");
  let abortController = new AbortController();

  function getUser() {
    return cache(userKey, () => apiGet(`/user`, { config }), {
      dedupe: 10,
      revalidate: 86400,
    });
  }

  const refresh: Platform["refresh"] = async () => {
    abortController.abort();
    abortController = new AbortController();
    if (progress !== "init") {
      progress = "updating";
    }
    try {
      user = await getUser();

      const [authoredMrs, assignedMrs, reviewMrs] = await Promise.all([
        apiGetAll(`/merge_requests`, {
          searchParams: { scope: "all", author_id: user.id, state: "opened" },
          signal: abortController.signal,
          config,
        }),
        apiGetAll(`/merge_requests`, {
          searchParams: { scope: "all", assignee_id: user.id, state: "opened" },
          signal: abortController.signal,
          config,
        }),
        apiGetAll(`/merge_requests`, {
          searchParams: { scope: "all", reviewer_id: user.id, state: "opened" },
          signal: abortController.signal,
          config,
        }),
      ]);
      const mrsIncludingApprovals = [
        ...assignedMrs,
        ...(await Promise.all(
          [authoredMrs, reviewMrs].flat().map(async (mr) => {
            const approvals = await apiGet(
              "/projects/{projectId}/merge_requests/{iid}/approvals",
              {
                params: { projectId: mr.project_id, iid: mr.iid },
                config,
              },
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

async function apiGet<T extends keyof GitLabGetRequests>(
  path: T,
  options: RequestInit & {
    params?: PathParams<T>;
    searchParams?: Record<string, number | string>;
    config: GitLabConfig;
  },
): Promise<GitLabGetRequests[T]> {
  const { params, searchParams, config, ...init } = options;
  const { auth } = options.config;
  const headers = new Headers(init.headers);
  headers.set("Private-Token", auth.privateToken);
  const url = buildUrl(path, params ?? ({} as PathParams<T>), searchParams);
  const response = await fetch(`https://${auth.domain}/api/v4${url}`, {
    ...init,
    headers,
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
}

async function apiGetAll<T extends keyof GitLabGetRequests>(
  path: T,
  options: RequestInit & {
    params?: PathParams<T>;
    searchParams?: Record<string, number | string>;
    config: GitLabConfig;
  },
): Promise<GitLabGetRequests[T]> {
  // @todo Retrieve all pages based on the `X-` headers.
  return apiGet(path, options);
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

function mergeRequestToTask(
  mr: GitLabMergeRequest & { approvals?: GitLabApprovals },
): Task {
  return {
    id: `${mr.id}`,
    title: mr.title,
    url: mr.web_url,
    author: {
      name: mr.author.name,
      getAvatar() {
        return mr.author.avatar_url;
      },
    },
    getCollaborators() {
      // @todo Trigger update?
      const collaborators: Collaborator[] = $state([
        ...mr.reviewers.map((reviewer) =>
          userToCollaborator(reviewer, mr.approvals),
        ),
        ...mr.assignees.map((user) => userToCollaborator(user)),
      ]);

      return collaborators;
    },
  };
}

function userToCollaborator(
  user: GitLabUser,
  approvals?: GitLabApprovals,
): Collaborator {
  const approved = approvals?.approved_by.find(
    (reviewer) => reviewer.user.id === user.id,
  );
  return {
    name: user.name,
    getAvatar() {
      return user.avatar_url;
    },
    icon: approved ? "completed" : undefined,
    status: approved ? "Approved" : undefined,
  };
}
