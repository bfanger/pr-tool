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

export default function jira(config: JiraConfig): Platform {
  const progress: Progress = $state("init");
  const tasks: Task[] = $state([]);

  let abortController = new AbortController();

  async function refresh() {
    abortController.abort();
    abortController = new AbortController();
    const accessToken = localStorage.getItem(
      `jira:accessToken:${config.cloudid}`,
    );
    if (typeof accessToken !== "string") {
      throw new Error("No access token found");
    }

    const apiConfig = {
      auth: { cloudid: config.cloudid, accessToken },
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
