/**
 * https://docs.github.com/en/graphql
 */

import poll from "../services/poll";
import {
  githubGraphql,
  githubPullRequestToTask,
  githubQuery,
  type GithubQuery,
} from "./github-api";
import type { GitHubConfig, Platform, Progress, Task } from "./types";
import githubIcon from "../assets/img/github.svg";

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
      minimumDate.setMonth(minimumDate.getMonth() - 18);

      for (const pr of data.user.pullRequests.nodes) {
        const updateAt = new Date(pr.updatedAt);
        if (updateAt.getTime() < minimumDate.getTime()) {
          continue;
        }
        tasks.push(githubPullRequestToTask(pr, data.user));
      }
      progress = "idle";
    } catch (err) {
      if (signal.aborted) {
        return;
      }
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
    icon: githubIcon,
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
