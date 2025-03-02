import gql from "../services/gql";
import sleep from "../services/sleep";
import githubIcon from "../assets/img/github.svg";
import type { Collaborator } from "./types";

export type GithubQuery = {
  user: {
    avatarUrl: string;
    name: string;
    pullRequests: {
      totalCount: number;
      nodes: {
        id: string;
        number: number;
        title: string;
        updatedAt: string;
        url: string;
        repository: { name: string };
        assignees: { nodes: { login: string; avatarUrl: string }[] };
        reviewRequests: {
          nodes: {
            login: string;
            avatarUrl: string;
          }[];
        };
        latestReviews: {
          nodes: {
            author: {
              login: string;
              avatarUrl: string;
            };
          }[];
        };
      }[];
    };
  };
};

export const githubQuery = gql`
  query GitHubInfo($login: String!) {
    user(login: $login) {
      avatarUrl
      name
      pullRequests(
        first: 25
        states: OPEN
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        totalCount
        nodes {
          id
          url
          number
          title
          updatedAt
          repository {
            name
          }
          assignees(first: 5) {
            nodes {
              login
              avatarUrl
            }
          }
          latestReviews(first: 5) {
            nodes {
              author {
                login
                avatarUrl
              }
            }
          }
        }
      }
    }
  }
`;

type ApiConfig = {
  auth: { login: string; accessToken: string };
  signal: AbortSignal;
  delay?: number;
  jitter?: number;
};

export async function githubGraphql<T>(
  query: string,
  variables: Record<string, any>,
  config: ApiConfig,
): Promise<T> {
  const init: RequestInit = {};
  init.method = "POST";
  init.body = JSON.stringify({
    query,
    variables,
  });
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${config.auth.accessToken}`);
  const response = await fetch(`https://api.github.com/graphql`, {
    ...init,
    headers,
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  if (data.errors) {
    if (data.errors.some((err: any) => err.type === "RATE_LIMITED")) {
      const reset = response.headers.get("X-RateLimit-Reset");
      if (reset) {
        const resetDate = new Date(+reset * 1000);
        const delay = Math.max(0, resetDate.getTime() - Date.now()) + 1000;
        await sleep(delay + 5_000, { signal: config.signal });
        return githubGraphql(query, variables, config);
      }
    }
    throw new Error(data.errors.map((e: any) => e.message).join("\n"));
  }
  return data.data;
}

export function githubPullRequestToTask(
  pr: GithubQuery["user"]["pullRequests"]["nodes"][number],
  user: GithubQuery["user"],
) {
  return {
    id: pr.id,
    code: `PR-${pr.number}`,
    title: pr.title,
    url: pr.url,
    attentionNeeded: false,
    timestamp: new Date(pr.updatedAt).getTime(),
    owners: [
      {
        getAvatar: () => user.avatarUrl,
        name: user.name,
      },
    ],
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
    getGroup: () => ({
      id: `github\n${pr.repository.name}`,
      icon: githubIcon,
      title: pr.repository.name,
    }),
  };
}
