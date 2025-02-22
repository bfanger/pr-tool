/**
 * https://developer.atlassian.com/cloud/jira/platform/rest/v3/
 */

import { PUBLIC_JIRA_CLIENT_ID } from "$env/static/public";
import { z } from "zod";
import type { PathParams } from "../services/buildUrl";
import buildUrl from "../services/buildUrl";
type JiraGetRequests = {
  "/rest/api/3/myself": unknown;
  "/rest/api/3/issue/{issueIdOrKey}": unknown;
  "/rest/api/3/search": SearchResultDto;
};

/**
 * Url for the OAuth login page
 *
 * https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/
 * https://developer.atlassian.com/console/myapps/
 */
export function jiraLoginUrl(state?: string) {
  if (state === undefined) {
    state = Math.random().toString(36).slice(2);
    sessionStorage.setItem("jira:oauth:state", state);
  }
  return `https://auth.atlassian.com/authorize?${new URLSearchParams({
    audience: "api.atlassian.com",
    client_id: PUBLIC_JIRA_CLIENT_ID,
    prompt: "consent",
    redirect_uri: "https://pr.bfanger.nl/app/oauth/jira",
    response_type: "code",
    scope: "read:jira-work",
    state,
  })}`;
}

type ApiConfig = {
  auth: {
    cloudid: string;
    accessToken: string;
  };
  signal: AbortSignal;
  delay?: number;
  jitter?: number;
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
  //   const url = `${config.domain}${buildUrl(path, params ?? ({} as PathParams<T>), searchParams)}`;
  //   console.log({ url, config, path, request });
  init.headers = new Headers(init.headers);
  const url = `https://api.atlassian.com/ex/jira/${config.auth.cloudid}${buildUrl(path, params ?? ({} as PathParams<T>), searchParams)}`;
  init.headers.set("Authorization", `Bearer ${config.auth.accessToken}`);
  //
  // fetch(
  const response = await fetch(url, init);
  let data;
  if (response.headers.get("Content-Type")?.startsWith("application/json")) {
    data = await response.json();
  }
  if (!response.ok) {
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
    issuelinks: Issuelink[];
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
    parent?: Parent;
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

type Issuelink = {
  id: string;
  self: string;
  type: {
    id: string;
    name: string;
    inward: string;
    outward: string;
    self: string;
  };
  outwardIssue?: Parent;
  inwardIssue?: Parent;
};
type Parent = {
  id: string;
  key: string;
  self: string;
  fields: ParentFields;
};
type ParentFields = {
  summary: string;
  status: StatusDto;
  priority: PriorityDto;
  issuetype: IssueTypeDto;
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
