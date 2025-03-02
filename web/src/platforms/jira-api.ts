/**
 * https://developer.atlassian.com/cloud/jira/platform/rest/v3/
 */

import { z } from "zod";
import type { PathParams } from "../services/buildUrl";
import buildUrl from "../services/buildUrl";
import jiraIcon from "../assets/img/jira.png";
import type { Collaborator, Task } from "./types";

type JiraGetRequests = {
  "/rest/api/3/myself": unknown;
  "/rest/api/3/issue/{issueIdOrKey}": unknown;
  "/rest/api/3/search": SearchResultDto;
};

type ApiConfig = {
  cloudid: string;
  signal: AbortSignal;
  delay?: number;
  jitter?: number;
  refreshed?: true;
};
export async function jiraGet<T extends keyof JiraGetRequests>(
  path: T,
  request: RequestInit & {
    params?: PathParams<T>;
    searchParams?: Record<string, number | string>;
  },
  config: ApiConfig,
): Promise<JiraGetRequests[T]> {
  const { params, searchParams, ...init } = request;
  init.headers = new Headers(init.headers);
  const accessToken = localStorage.getItem("app_jira_accessToken");
  if (!accessToken) {
    throw new Error("Missing accessToken");
  }
  if (isJwtExpired(accessToken) && !config.refreshed) {
    await refreshTokens();
    return await jiraGet(path, request, { ...config, refreshed: true });
  }
  const url = `https://api.atlassian.com/ex/jira/${config.cloudid}${buildUrl(path, params ?? ({} as PathParams<T>), searchParams)}`;
  init.headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(url, init);
  let data;
  if (response.headers.get("Content-Type")?.startsWith("application/json")) {
    data = await response.json();
  }
  if (!response.ok) {
    if (response.status === 401) {
      if (!config.refreshed) {
        await refreshTokens();
        return jiraGet(path, request, { ...config, refreshed: true });
      }
      throw new Error("Unauthorized");
    }
    const result = z
      .object({ errorMessages: z.array(z.string()) })
      .safeParse(data);
    if (result.success) {
      throw new Error(result.data.errorMessages.join("\n"));
    }
    throw new Error(`${response.statusText} Jira API error`);
  }
  return data;
}

let refreshPromise: Promise<void> | undefined;
async function refreshTokens() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch("/app/oauth/jira/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: localStorage.getItem("app_jira_refreshToken"),
        }),
      });
      if (!response.ok) {
        throw new Error("Refreshing token failed");
      }
      const { accessToken, refreshToken } = z
        .object({ accessToken: z.string(), refreshToken: z.string() })
        .parse(await response.json());
      localStorage.setItem("app_jira_accessToken", accessToken);
      localStorage.setItem("app_jira_refreshToken", refreshToken);
    })();
    refreshPromise.catch((err) => {
      refreshPromise = undefined;
      throw err;
    });
  }
  return refreshPromise;
}
export function jiraIssueToTask(issue: IssueDto, domain: string): Task {
  const task: Task = {
    id: issue.key,
    title: issue.fields.summary,
    code: issue.key,
    timestamp: new Date(issue.fields.updated).getTime(),
    url: `${domain}/browse/${issue.key}`,
    attentionNeeded: false,
    owners: [],
    getCollaborators: () => {
      const collaborators: Collaborator[] = [];
      if (issue.fields.creator.accountId !== issue.fields.assignee?.accountId) {
        collaborators.push({
          getAvatar: () => issue.fields.creator.avatarUrls["48x48"],
          name: issue.fields.creator.displayName,
        });
      }
      return collaborators;
    },
    getGroup: () => ({
      id: `jira\n${issue.fields.project.id}`,
      icon: jiraIcon,
      title: issue.fields.project.name,
    }),
  };
  if (issue.fields.assignee) {
    task.owners.push({
      getAvatar: () => issue.fields.assignee.avatarUrls["48x48"],
      name: issue.fields.assignee.displayName,
    });
  }

  return task;
}

function isJwtExpired(jwt: string) {
  try {
    const [, payload] = jwt.split(".");
    const decoded = JSON.parse(atob(payload ?? "")) as { exp: number };
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch (err: unknown) {
    console.warn(err);
    return true;
  }
}
type SearchResultDto = {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: IssueDto[];
};

type IssueDto = {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: {
    statuscategorychangedate: string;
    fixVersions: {
      self: string;
      id: string;
      description: string;
      name: string;
      archived: boolean;
      released: boolean;
      releaseDate: Date;
    }[];
    resolution: PriorityDto | null;
    lastViewed: null | string;
    priority: PriorityDto;
    labels: any[];
    aggregatetimeoriginalestimate: number | null;
    timeestimate: number | null;
    versions: any[];
    issuelinks: {
      id: string;
      self: string;
      type: {
        id: string;
        name: string;
        inward: string;
        outward: string;
        self: string;
      };
      outwardIssue?: ParentDto;
      inwardIssue?: ParentDto;
    }[];
    assignee: UserDto;
    status: StatusDto;
    components: any[];
    aggregatetimeestimate: number | null;
    creator: UserDto;
    subtasks: any[];
    reporter: UserDto;
    aggregateprogress: ProgressDto;
    progress: ProgressDto;
    votes: {
      self: string;
      votes: number;
      hasVoted: boolean;
    };
    issuetype: IssueTypeDto;
    timespent: number | null;
    project: {
      self: string;
      id: string;
      key: string;
      name: string;
      projectTypeKey: string;
      simplified: boolean;
      avatarUrls: AvatarsDto;
      projectCategory: PriorityDto;
    };
    aggregatetimespent: number | null;
    resolutiondate: null | string;
    workratio: number;
    watches: {
      self: string;
      watchCount: number;
      isWatching: boolean;
    };
    created: string;
    updated: string;
    timeoriginalestimate: number | null;
    description: {
      type: string;
      version: number;
      content: {
        type: string;
        content: {
          type: string;
          text?: string;
          marks?: MarkDto[];
          content?: {
            type: string;
            content: {
              type: string;
              text: string;
              marks?: MarkDto[];
            }[];
          }[];
          attrs?: {
            type?: string;
            id?: string;
            collection?: string;
            height?: number;
            width?: number;
            url?: string;
          };
        }[];
        attrs?: {
          language?: string;
          layout?: string;
        };
      }[];
    } | null;
    security: null;
    summary: string;
    environment: null;
    duedate: null;
    parent?: ParentDto;
  };
};

type ProgressDto = {
  progress: number;
  total: number;
  percent?: number;
};

type UserDto = {
  self: string;
  accountId: string;
  emailAddress?: string;
  avatarUrls: AvatarsDto;
  displayName: string;
  active: boolean;
  timeZone: string;
  accountType: string;
};

type AvatarsDto = {
  "48x48": string;
  "24x24": string;
  "16x16": string;
  "32x32": string;
};

type MarkDto = {
  type: string;
};

type ParentDto = {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    status: StatusDto;
    priority: PriorityDto;
    issuetype: IssueTypeDto;
  };
};

type IssueTypeDto = {
  self: string;
  id: string;
  description: string;
  iconUrl: string;
  name: "Bug" | "Epic" | "Story" | "Taak";
  subtask: boolean;
  avatarId: number;
  entityId: string;
  hierarchyLevel: number;
};

type PriorityDto = {
  self: string;
  iconUrl?: string;
  name: string;
  id: string;
  description?: string;
};

type StatusDto = {
  self: string;
  description: string;
  iconUrl: string;
  name: string;
  id: string;
  statusCategory: {
    self: string;
    id: number;
    key: string;
    colorName: string;
    name: string;
  };
};
