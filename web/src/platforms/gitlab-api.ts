/**
 * https://docs.gitlab.com/ee/api/rest/
 */
import type { PathParams } from "../services/buildUrl";
import buildUrl from "../services/buildUrl";
import resilient from "../services/resilient";
import type { Collaborator, Task } from "./types";
import gitlabIcon from "../assets/img/gitlab.png";

export type GitLabGetRequests = {
  "/user": GitLabUser;
  "/merge_requests": GitLabMergeRequest[];
  "/projects": GitLabProject[];
  "/projects/{projectId}/merge_requests": GitLabMergeRequest[];
  "/projects/{projectId}/merge_requests/{iid}/approvals": GitLabApprovals;
  "/events": GitLabEvent[];
};

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
  user_notes_count: number;
  updated_at: string;
} & { [key: string]: unknown };

export type GitLabApprovals = {
  approved_by: { user: GitLabUser }[];
};

export type GitLabProject = {
  id: number;
  name: string;
} & { [key: string]: unknown };

export const gitlabEventsTypes = [
  "accepted",
  "approved",
  "closed",
  "commented on",
  "deleted",
  "opened",
  "pushed new",
  "pushed to",
] as const;
export type GitLabEvent = {
  action_name: (typeof gitlabEventsTypes)[number];
  author_id: number;
  project_id: number;
  target_type: "MergeRequest" | null;
  target_id: number;
} & { [key: string]: unknown };

const responses = new WeakMap<any, Response>();

type ApiConfig = {
  auth: { domain: string; privateToken: string };
  signal: AbortSignal;
  delay?: number;
  jitter?: number;
};

export async function gitlabGet<T extends keyof GitLabGetRequests>(
  path: T,
  request: RequestInit & {
    params?: PathParams<T>;
    searchParams?: Record<string, number | string>;
  },
  config: ApiConfig,
): Promise<GitLabGetRequests[T]> {
  const { params, searchParams, ...init } = request;
  const { auth, delay } = config;
  const headers = new Headers(init.headers);
  headers.set("Private-Token", auth.privateToken);
  const url = buildUrl(path, params ?? ({} as PathParams<T>), searchParams);
  const response = await resilient(
    {
      delay,
      retries: 3,
      timeout: 20_000,
      signal: config.signal,
      jitter: config.jitter,
    },
    () => fetch(`https://${auth.domain}/api/v4${url}`, { ...init, headers }),
  );
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  responses.set(data, response);
  return data;
}

/**
 * Retrieve all pages based on the `X-` headers.
 */
export async function gitlabGetAll<T extends keyof GitLabGetRequests>(
  path: T,
  options: RequestInit & {
    params?: PathParams<T>;
    searchParams?: Record<string, number | string>;
  },
  config: ApiConfig,
  stream?: (
    item: GitLabGetRequests[T] extends any[]
      ? GitLabGetRequests[T][number]
      : never,
  ) => void | Promise<void>,
): Promise<GitLabGetRequests[T]> {
  const init = { ...options };
  if (!init.searchParams?.per_page) {
    init.searchParams = { ...init.searchParams, per_page: 100 };
  }
  const page1 = await gitlabGet(path, init, config);
  const response = responses.get(page1);
  if (!response) {
    return page1;
  }
  const pageCount = parseInt(
    response.headers.get("x-total-pages") as string,
    10,
  );
  const streamPromise = Promise.all(
    stream ? (page1 as any[]).map((item: any) => stream(item)) : [],
  );
  if (Number.isNaN(pageCount) || pageCount === 1) {
    await streamPromise;
    return page1;
  }

  const delay = config.delay ?? 0;
  const remainingPages: GitLabGetRequests[T][] = await Promise.all(
    new Array(pageCount - 1).fill(0).map((_, i) =>
      gitlabGet(
        path,
        {
          ...init,
          searchParams: { ...init.searchParams, page: i + 2 },
        },
        { ...config, delay: delay + (i + 1) * 75 },
      ).then(async (page) => {
        if (stream) {
          await Promise.all((page as any).map((item: any) => stream(item)));
        }
        return page;
      }),
    ),
  );
  await streamPromise;
  return [page1, ...remainingPages].flat() as any as GitLabGetRequests[T];
}

export function gitlabMergeRequestToTask(
  mr: GitLabMergeRequest & { approvals?: GitLabApprovals },
  {
    currentUserId,
    getProjectName,
  }: {
    currentUserId: number;
    getProjectName: (id: number) => string;
  },
): Task {
  return {
    id: `${mr.id}`,
    title: mr.title,
    code: `MR-${mr.iid}`,
    url: mr.web_url,
    attentionNeeded: isAttentionNeeded(mr, currentUserId),
    timestamp: new Date(mr.updated_at).getTime(),
    owners: [
      {
        name: mr.author.name,
        getAvatar() {
          return mr.author.avatar_url;
        },
      },
      ...mr.assignees
        .filter((user) => user.id !== mr.author.id)
        .map((user) => gitlabUserToCollaborator(user)),
    ],
    getGroup: () => ({
      id: `gitlab\n${currentUserId}\n${mr.project_id}`,
      title: getProjectName(mr.project_id),
      icon: gitlabIcon,
    }),
    getCollaborators() {
      return [
        ...mr.reviewers.map((reviewer) =>
          gitlabUserToCollaborator(reviewer, mr.approvals),
        ),
      ];
    },
  };
}

export function gitlabUserToCollaborator(
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

export async function gitLabMergeRequestWithApprovals(
  mr: GitLabMergeRequest,
  config: ApiConfig,
): Promise<GitLabMergeRequest & { approvals?: GitLabApprovals }> {
  const approvals = await gitlabGet(
    "/projects/{projectId}/merge_requests/{iid}/approvals",
    { params: { projectId: mr.project_id, iid: mr.iid } },
    config,
  );
  return { ...mr, approvals };
}

function isAttentionNeeded(
  mr: GitLabMergeRequest & { approvals?: GitLabApprovals },
  currentUserId: number,
): boolean {
  if (!currentUserId) {
    return false;
  }
  if (mr.author.id === currentUserId) {
    if (mr.draft) {
      return true; // In draft by current user
    }
    if (mr.has_conflicts) {
      return true; // Merge Conflicts
    }
    if (mr.user_notes_count > 0) {
      return true; // Has comments (TODO: check resolved)
    }
    if (mr.reviewers.length === 0) {
      return true; // No reviewers assigned
    }
    return mr.reviewers.length === mr.approvals?.approved_by.length; // Approved, ready to merge
  } else if (mr.draft) {
    return false; // In draft by others
  }
  if (mr.assignees.find((assignee) => assignee.id === currentUserId)) {
    return true; // Assigned
  }
  if (mr.reviewers.find((reviewer) => reviewer.id === currentUserId)) {
    if (
      mr.approvals?.approved_by.find(
        (approval) => approval.user.id === currentUserId,
      )
    ) {
      return false; // Already approved
    }
    return true; // Review requested
  }
  return false;
}
