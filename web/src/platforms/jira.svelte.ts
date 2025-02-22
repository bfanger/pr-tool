/**
 * https://developer.atlassian.com/cloud/jira/platform/rest/v3/
 */
import { jiraGet } from "./jira-api";
import type {
  Collaborator,
  JiraConfig,
  Platform,
  Progress,
  Task,
} from "./types";
import {
  PUBLIC_JIRA_CLIENT_ID,
  PUBLIC_JIRA_REDIRECT_URI,
} from "$env/static/public";

export default function jira(config: JiraConfig): Platform {
  const progress: Progress = $state("init");
  const tasks: Task[] = $state([]);

  let abortController = new AbortController();

  async function refresh() {
    abortController.abort();
    abortController = new AbortController();
    const accessToken = localStorage.getItem("app_jira_accessToken");
    const refreshToken = localStorage.getItem("app_jira_refreshToken");
    if (!accessToken) {
      throw new Error("No access token");
    }
    const apiConfig = {
      cloudid: config.cloudid,
      accessToken,
      refreshToken,
      signal: abortController.signal,
    };
    const results = await jiraGet(
      "/rest/api/3/search",
      {
        searchParams: {
          jql: "assignee=currentuser() AND resolution=unresolved AND sprint in openSprints()",
        },
      },
      apiConfig,
    );
    tasks.length = 0;
    for (const issue of results.issues) {
      tasks.push({
        attentionNeeded: false,
        author: {
          getAvatar: () => issue.fields.creator.avatarUrls["48x48"],
          name: issue.fields.creator.displayName,
        },
        getCollaborators: () => {
          const collaborators: Collaborator[] = [];
          if (issue.fields.assignee) {
            collaborators.push({
              getAvatar: () => issue.fields.assignee.avatarUrls["48x48"],
              name: issue.fields.assignee.displayName,
            });
          }
          return collaborators;
        },
        getGroup: () => issue.fields.project.name,
        id: issue.key,
        timestamp: new Date(issue.fields.updated).getTime(),
        title: issue.fields.summary,
        url: `${config.domain}/browse/${issue.key}`,
      });
    }
  }

  return {
    get tasks() {
      return tasks;
    },
    get progress() {
      return progress;
    },
    refresh,
    abort: () => abortController.abort(),
  };
}

/**
 * Url for the OAuth login page
 *
 * https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/
 * https://developer.atlassian.com/console/myapps/
 */
export function jiraLogin(state?: string) {
  if (state === undefined) {
    state = Math.random().toString(36).slice(2);

    const url = `https://auth.atlassian.com/authorize?${new URLSearchParams({
      audience: "api.atlassian.com",
      client_id: PUBLIC_JIRA_CLIENT_ID,
      prompt: "consent",
      redirect_uri: PUBLIC_JIRA_REDIRECT_URI,
      response_type: "code",
      scope: "read:jira-work offline_access",
      state,
    })}`;

    (window as any).cookieStore.set("jira_client_state", state, {
      path: "/",
      sameSite: "strict",
    });

    setTimeout(() => {
      location.href = url;
    }, 100);
  }
  return;
}
