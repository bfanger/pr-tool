/**
 * https://docs.github.com/en/graphql
 */

import poll from "../services/poll";
import { githubGraphql, githubQuery, type GithubQuery } from "./github-api";
import type {
  Collaborator,
  GitHubConfig,
  Platform,
  Progress,
  Task,
} from "./types";

export default function github({ auth }: GitHubConfig): Platform {
  let progress: Progress = $state("init");

  let tasks: Task[] = $state([]);

  let refreshController = new AbortController();

  async function update(signal: AbortSignal) {
    if (progress === "idle") {
      progress = "updating";
    }
    try {
      const data = await githubGraphql<GithubQuery>(
        githubQuery,
        { login: auth.login },
        { auth, signal },
      );

      tasks = [];
      const minimumDate = new Date();
      minimumDate.setMonth(minimumDate.getMonth() - 6);

      for (const pr of data.user.pullRequests.nodes) {
        const updateAt = new Date(pr.updatedAt);
        if (updateAt.getTime() < minimumDate.getTime()) {
          continue;
        }
        tasks.push({
          id: pr.id,
          title: pr.title,
          url: pr.url,
          attentionNeeded: false,
          author: {
            getAvatar: () => data.user.avatarUrl,
            name: data.user.name,
          },
          getCollaborators() {
            const collaborators: Collaborator[] = [];
            for (const assignee of pr.assignees.nodes) {
              collaborators.push({
                getAvatar: () => assignee.avatarUrl,
                name: assignee.login,
              });
            }
            for (const review of pr.latestReviews.nodes) {
              collaborators.push({
                getAvatar: () => review.author.avatarUrl,
                name: review.author.login,
              });
            }
            return collaborators;
          },
          getGroup: () => pr.repository.name,
        });
      }
      progress = "idle";
    } catch (err) {
      progress = "error";
      throw err;
    }
  }

  async function refresh() {
    if (progress !== "init") {
      progress = "refreshing";
    }
    refreshController.abort();
    refreshController = new AbortController();
    const signal = refreshController.signal;
    await update(signal);

    poll(() => update(signal), { gap: 3600, signal });
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
