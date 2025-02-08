/**
 * https://docs.gitlab.com/ee/api/rest/
 */
import type { PathParams } from "../services/buildUrl";
import buildUrl from "../services/buildUrl";
import harden from "../services/resilient";
import type { Collaborator, Task } from "./types";

export type GitLabGetRequests = {
  "/user": GitLabUser;
  "/merge_requests": GitLabMergeRequest[];
  "/projects/{projectId}/merge_requests/{iid}/approvals": GitLabApprovals;
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
  updated_at: string;
} & { [key: string]: unknown };

export type GitLabApprovals = {
  approved_by: { user: GitLabUser }[];
};

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
  const response = await harden(
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
 *
 */
export async function gitlabGetAll<T extends keyof GitLabGetRequests>(
  path: T,
  options: RequestInit & {
    params?: PathParams<T>;
    searchParams?: Record<string, number | string>;
  },
  config: ApiConfig,
): Promise<GitLabGetRequests[T]> {
  // @todo Retrieve all pages based on the `X-` headers.
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
  if (Number.isNaN(pageCount) || pageCount === 1) {
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
      ),
    ),
  );
  return [page1, ...remainingPages].flat() as any as GitLabGetRequests[T];
}

export function gitlabMergeRequestToTask(
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
      return [
        ...mr.reviewers.map((reviewer) =>
          gitlabUserToCollaborator(reviewer, mr.approvals),
        ),
        ...mr.assignees.map((user) => gitlabUserToCollaborator(user)),
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
