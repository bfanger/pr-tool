import gql from "../services/gql";
import sleep from "../services/sleep";

export type GitHubPullRequests = {
  repositoryOwner: {
    repositories: {
      nodes: {
        name: string;
        pullRequests: {
          nodes: {
            id: string;
            title: string;
            url: string;
            author: { avatarUrl: string; login: string };
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
      }[];
    };
  };
};
export const githubPullRequestsQuery = gql`
  query PullRequests($login: String!) {
    repositoryOwner(login: $login) {
      repositories(first: 100, isArchived: false) {
        nodes {
          ... on Repository {
            name
            pullRequests(first: 25, states: OPEN) {
              nodes {
                id
                url
                title
                author {
                  avatarUrl
                  login
                }
                author {
                  avatarUrl
                  login
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
  config: ApiConfig,
): Promise<T> {
  const init: RequestInit = {};
  init.method = "POST";
  init.body = JSON.stringify({
    query,
    variables: { login: config.auth.login },
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
        return githubGraphql(query, config);
      }
    }
    throw new Error(data.errors.map((e: any) => e.message).join("\n"));
  }
  return data.data;
}
