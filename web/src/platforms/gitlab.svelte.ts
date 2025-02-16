/**
 * https://docs.gitlab.com/ee/api/rest/
 */
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
  gitLabMergeRequestWithApprovals,
} from "./gitlab-api";
import type { GitLabConfig, Platform, Progress } from "./types";

export default function gitlab({ auth }: GitLabConfig): Platform {
  let progress: Progress = $state("init");
  let currentUser: GitLabUser = $state(undefined as any);
  const projects: Record<number, GitLabProject> = $state({});
  let mergeRequests: Record<
    number,
    GitLabMergeRequest & { approvals?: GitLabApprovals }
  > = $state({});

  let tasks = $derived(
    Object.values(mergeRequests).map((mr) =>
      gitlabMergeRequestToTask(mr, {
        currentUserId: currentUser.id,
        getProjectName,
      }),
    ),
  );

  const userKey = Symbol("user");
  const projectsKey = Symbol("projects");
  let refreshController = new AbortController();
  let previousUpdate: Date;

  function getUser(signal: AbortSignal) {
    return cache(userKey, () => gitlabGet(`/user`, {}, { auth, signal }), {
      dedupe: 10,
      revalidate: 86400,
    });
  }

  function getProjectName(projectId: number) {
    return projects[projectId]?.name ?? `Project ${projectId} (${auth.domain})`;
  }

  async function checkForUpdates(signal: AbortSignal) {
    const updateStart = new Date();
    if (progress === "idle") {
      progress = "updating";
    }
    try {
      const promise = gitlabGetAll(
        "/events",
        { searchParams: { scope: "all", after: previousUpdate.toISOString() } },
        { auth, signal },
      );
      const events = await promise;
      const updatedProjects = new Set<number>();
      for (const event of events) {
        if (event.project_id) {
          updatedProjects.add(event.project_id);
        }
      }
      await Promise.all(
        updatedProjects.values().map(async (projectId, i) => {
          await gitlabGetAll(
            "/projects/{projectId}/merge_requests",
            { params: { projectId }, searchParams: { scope: "all" } },
            { auth, signal },
            async (mr) => {
              if (mr.state !== "open") {
                if (mergeRequests[mr.id]) {
                  delete mergeRequests[mr.id];
                }
                return;
              }
              if (
                mr.author.id !== currentUser.id &&
                !(
                  mr.assignees.find((user) => user.id === currentUser.id) ||
                  mr.reviewers.find((user) => user.id === currentUser.id)
                )
              ) {
                if (mergeRequests[mr.id]) {
                  delete mergeRequests[mr.id];
                }
                return;
              }
              mergeRequests[mr.id] = await gitLabMergeRequestWithApprovals(mr, {
                auth,
                signal,
                delay: i * 150,
              });
            },
          );
        }),
      );
      await Promise.all(
        Object.values(mergeRequests)
          .filter((mr) => !updatedProjects.has(mr.project_id))
          .map(async (mr, i) => {
            mergeRequests[mr.id] = await gitLabMergeRequestWithApprovals(mr, {
              auth,
              signal,
              delay: 100 * i,
            });
          }),
      );
    } catch (err) {
      progress = "error";
      throw err;
    }
    if (previousUpdate.getTime() < updateStart.getTime()) {
      previousUpdate = updateStart;
    }
    if (progress === "updating" || progress === "error") {
      progress = "idle";
    }
  }

  async function refresh() {
    refreshController.abort();
    refreshController = new AbortController();
    const signal = refreshController.signal;

    previousUpdate = new Date();

    if (progress !== "init") {
      progress = "refreshing";
    }
    try {
      const projectPromise = cache(
        projectsKey,
        () =>
          gitlabGetAll(
            "/projects",
            { searchParams: { order_by: "last_activity_at", per_page: 50 } },
            { auth, signal },
            (project) => {
              projects[project.id] = project;
            },
          ),
        { dedupe: 10, revalidate: 3600 },
      );
      currentUser = await getUser(signal);

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
          { auth, signal, delay: 0 },
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
          { auth, signal, delay: 25 },
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
          { auth, signal, delay: 50, jitter: 2 },
        ),
      ]);
      const mrsIncludingApprovals = [
        ...assignedMrs,
        ...(await Promise.all(
          [authoredMrs, reviewMrs].flat().map(async (mr, i) =>
            gitLabMergeRequestWithApprovals(mr, {
              auth,
              signal,
              delay: i * 75,
            }),
          ),
        )),
      ];
      mergeRequests = Object.fromEntries(
        mrsIncludingApprovals.map((mr) => [mr.id, mr]),
      );

      poll(() => checkForUpdates(signal), { gap: 300, signal });

      await projectPromise;
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
    abort: () => {
      refreshController.abort();
    },
  } satisfies Platform;
}
