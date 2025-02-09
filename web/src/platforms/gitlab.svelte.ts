import cache from "../services/cache";
import poll from "../services/poll";
import {
  gitlabGetAll,
  gitlabGet,
  gitlabMergeRequestToTask,
  type GitLabApprovals,
  type GitLabMergeRequest,
  type GitLabUser,
  type GitLabProject,
} from "./gitlab-api";
import type { GitLabConfig, Platform, Progress } from "./types";

export default function gitlab({ auth }: GitLabConfig): Platform {
  let progress: Progress = $state("init");
  let currentUser: GitLabUser = $state(undefined as any);
  let projects = $state(new Map<number, GitLabProject>());
  let mergeRequests = $state(
    new Map<number, GitLabMergeRequest & { approvals?: GitLabApprovals }>(),
  );

  let tasks = $derived(
    mergeRequests
      .values()
      .map((mr) =>
        gitlabMergeRequestToTask(mr, {
          currentUserId: currentUser.id,
          getProjectName,
        }),
      )
      .toArray(),
  );

  const userKey = Symbol("user");
  const projectsKey = Symbol("projects");
  let refreshController = new AbortController();

  function getUser() {
    return cache(
      userKey,
      () => gitlabGet(`/user`, {}, { auth, signal: refreshController.signal }),
      {
        dedupe: 10,
        revalidate: 86400,
      },
    );
  }

  function getProjectName(projectId: number) {
    return (
      projects.get(projectId)?.name ?? `Project ${projectId} (${auth.domain})`
    );
  }
  let previousUpdate: Date;
  async function checkForUpdates() {
    if (progress === "idle") {
      progress = "updating";
    }
    const promise = gitlabGetAll(
      "/events",
      { searchParams: { scope: "all", after: previousUpdate.toISOString() } },
      { auth, signal: refreshController.signal },
    );
    previousUpdate = new Date();
    const events = await promise;
    console.info(events);
    if (progress === "updating") {
      progress = "idle";
    }
  }

  async function refresh() {
    refreshController.abort("refresh");
    refreshController = new AbortController();
    previousUpdate = new Date();
    const config = {
      auth,
      signal: refreshController.signal,
    };

    if (progress !== "init") {
      progress = "updating";
    }
    try {
      const projectPromise = cache(
        projectsKey,
        () => gitlabGetAll("/projects", {}, config),
        { dedupe: 10, revalidate: 3600 },
      );
      currentUser = await getUser();

      const [reviewMrs, authoredMrs, assignedMrs] = await Promise.all([
        gitlabGetAll(
          `/merge_requests`,
          {
            searchParams: {
              scope: "all",
              reviewer_id: currentUser.id,
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
              author_id: currentUser.id,
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
              assignee_id: currentUser.id,
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
      mergeRequests = new Map(mrsIncludingApprovals.map((mr) => [mr.id, mr]));
      poll(checkForUpdates, {
        gap: 300,
        signal: refreshController.signal,
      });
      // previousUpdate = new Date(2025, 1, 4, 0, 0, 0);
      // checkForUpdates();
      projects = new Map(
        (await projectPromise).map((project) => [project.id, project]),
      );
      progress = "idle";
    } catch (error) {
      progress = "error";
      throw error;
    }
  }

  return {
    get progress() {
      return progress;
    },
    get tasks() {
      return tasks;
    },
    refresh,
  } satisfies Platform;
}
