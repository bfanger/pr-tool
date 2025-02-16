/**
 * https://docs.github.com/en/graphql
 */

import poll from "../services/poll";
import {
  githubGraphql,
  githubPullRequestsQuery,
  type GitHubPullRequests,
} from "./github-api";
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
      const data = await githubGraphql<GitHubPullRequests>(
        githubPullRequestsQuery,
        { auth, signal },
      );

      tasks = [];
      for (const repository of data.repositoryOwner.repositories.nodes) {
        for (const pr of repository.pullRequests.nodes) {
          if (
            pr.author.login === auth.login ||
            pr.assignees.nodes.find((user) => user.login === auth.login) ||
            pr.latestReviews.nodes.find(
              (review) => review.author.login === auth.login,
            )
          ) {
            tasks.push({
              id: pr.id,
              title: pr.title,
              url: pr.url,
              attentionNeeded: false,
              author: {
                getAvatar: () => pr.author.avatarUrl,
                name: pr.author.login,
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
              getGroup: () => repository.name,
            });
          }
        }
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
