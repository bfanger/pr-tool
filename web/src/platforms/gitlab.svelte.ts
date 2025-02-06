import buildUrl, { type PathParams } from "../services/buildUrl";
import cache from "../services/cache";
import type { GitlabGetRequests, GitlabMergeRequest } from "./gitlab-types";
import type { GitlabConfig, Platform, Status, Todo } from "./types";

export default function gitlab(config: GitlabConfig): Platform {
  let status: Status = $state("init");
  let mergeRequests = $state(new Map<number, GitlabMergeRequest>());

  let activeTodos = $derived(
    mergeRequests
      .values()
      .filter((mr) => isActive(mr))
      .map(mergeRequestToTodo)
      .toArray(),
  );

  let stats: Platform["stats"] = $derived({
    active: activeTodos.length,
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
    if (status !== "init") {
      status = "updating";
    }
    try {
      const user = await getUser();

      const [author, assigned, reviewer] = await Promise.all([
        apiGetAll(`/merge_requests`, {
          searchParams: { author_id: user.id, state: "opened" },
          signal: abortController.signal,
          config,
        }),
        apiGetAll(`/merge_requests`, {
          searchParams: { assignee_id: user.id, state: "opened" },
          signal: abortController.signal,
          config,
        }),
        apiGetAll(`/merge_requests`, {
          searchParams: { reviewer_id: user.id, state: "opened" },
          signal: abortController.signal,
          config,
        }),
      ]);
      mergeRequests = new Map(
        [author, assigned, reviewer].flat().map((mr) => [mr.id, mr]),
      );
      status = "idle";
    } catch (error) {
      status = "error";
      throw error;
    }
  };

  return {
    get status() {
      return status;
    },
    get stats() {
      return stats;
    },
    getActiveTodos() {
      return {
        get status() {
          return status;
        },
        get items() {
          return activeTodos;
        },
      };
    },
    refresh,
  } satisfies Platform;
}

async function apiGet<T extends keyof GitlabGetRequests>(
  path: T,
  options: RequestInit & {
    params?: PathParams<T>;
    searchParams?: Record<string, number | string>;
    config: GitlabConfig;
  },
): Promise<GitlabGetRequests[T]> {
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

async function apiGetAll<T extends keyof GitlabGetRequests>(
  path: T,
  options: RequestInit & {
    params?: PathParams<T>;
    searchParams?: Record<string, number | string>;
    config: GitlabConfig;
  },
): Promise<GitlabGetRequests[T]> {
  // @todo Retrieve all pages based on the `X-` headers.
  return apiGet(path, options);
}

function isActive(mr: GitlabMergeRequest) {
  return !mr.draft;
}

function mergeRequestToTodo(mr: GitlabMergeRequest): Todo {
  return {
    id: `${mr.id}`,
    title: mr.title,
    url: mr.web_url,
    getAuthor() {
      return {
        status: "idle",
        author: {
          name: mr.author.name,
          getAvatar() {
            return { status: "idle", url: mr.author.avatar_url };
          },
        },
      };
    },
  };
}
