import { omit } from "lodash-es";
import { ajax } from "rxjs/ajax";
import type { AjaxRequest } from "rxjs/ajax";
import { map } from "rxjs/operators";
import type { Observable } from "rxjs";
import type { ProjectsResponse } from "./azure-api-types/projects-response";
import type { ProjectResponse } from "./azure-api-types/project-response";
import type { TeamResponse } from "./azure-api-types/team-response";
import type { PullRequestsResponse } from "./azure-api-types/pull-requests-response";
import type { ProfileResponse } from "./azure-api-types/profile-response";
import type { AvatarsResponse } from "./azure-api-types/avatars-response";
import type { UsersResponse } from "./azure-api-types/users-response";
import buildUrl from "./buildUrl";

interface Config extends Partial<AjaxRequest> {
  token: string; // Personal Authentication Token
  params?: Record<string, unknown>;
}
type ResponseMapGet = {
  "https://vssps.dev.azure.com/[organization]/_apis/profile/profiles/[id]": ProfileResponse;
  "https://vssps.dev.azure.com/[organization]/_apis/graph/users": UsersResponse;
  "https://vssps.dev.azure.com/[organization]/_apis/graph/subjects/[descriptor]/avatars": AvatarsResponse;
  "https://dev.azure.com/[organization]/_apis/projects": ProjectsResponse;
  "https://dev.azure.com/[organization]/_apis/projects/[projectId]": ProjectResponse;
  "https://dev.azure.com/[organization]/_apis/projects/[projectId]/teams/[teamId]": TeamResponse;
  "https://dev.azure.com/[organization]/[projectId]/_apis/git/pullrequests": PullRequestsResponse;
};

/**
 * Replace route parameters.
 *
 * Example:
 *  params('/article/[slug]', { params: { slug: 'test123' }}) => ['/article/test123', {}]
 *
 * @param path Path with placeholders: '/article/[slug]'
 * @param config Request config
 */
function applyParams(path: string, config: Config): AjaxRequest {
  const url = buildUrl(path, config.params as Record<string, string>);
  const request = omit(config, ["token", "params"]) as AjaxRequest;
  request.url = url;
  request.headers = { ...(request.headers || {}) };
  if (config.token) {
    const headers = request.headers as any;
    headers.Authorization = `Basic ${window.btoa(
      `pr-notifications:${config.token}`
    )}`;
  }
  return request;
}
function fetch<Response>(
  method: "GET",
  path: string,
  config: Config
): Observable<Response> {
  return ajax<any>(applyParams(path, { ...config, method })).pipe(
    map(({ status, response }) => {
      if (status === 203) {
        if (response === null) {
          throw new Error("Invalid response");
        }
      }
      return response;
    })
  );
}
const azureApi = {
  get<P extends keyof ResponseMapGet>(path: P, options: Config) {
    return fetch<ResponseMapGet[P]>("GET", path, options);
  },
};
export default azureApi;
