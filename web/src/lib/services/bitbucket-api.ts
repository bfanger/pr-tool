import type { Observable } from "rxjs";
import { ajax } from "rxjs/ajax";
import type { AjaxRequest } from "rxjs/ajax";
import { omit } from "lodash-es";
import { map } from "rxjs/operators";
import type { PullRequestsResponse } from "./bitbucket-api-types/pull-requests-response";
import type { ProjectsResponse } from "./bitbucket-api-types/projects-response";
import type { UserResponse } from "./bitbucket-api-types/user-response";
import proxy from "./proxy";
import buildUrl from "./buildUrl";

interface Config extends Partial<AjaxRequest> {
  token: string; // Personal Access Token
  proxy: boolean;
  params: { domain: string } & Record<string, string | number>;
}
type ResponseMapGet = {
  "https://[domain]/rest/api/1.0/users/[username]": UserResponse;
  "https://[domain]/rest/api/1.0/projects": ProjectsResponse;
  "https://[domain]/rest/api/1.0/dashboard/pull-requests": PullRequestsResponse;
};
export const USERNAME = Symbol("USERNAME");
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
    headers.Authorization = `Bearer ${config.token}`;
  }
  return request;
}
function fetch<Response>(
  method: "GET",
  path: string,
  config: Config
): Observable<Response> {
  let client: typeof proxy = ajax;
  if (config.proxy) {
    client = proxy;
  }
  return client(applyParams(path, { ...config, method })).pipe(
    map(({ response, xhr }) => {
      const username = xhr.getResponseHeader("x-ausername");
      if (!username) {
        throw new Error("Not authorized");
      }
      response[USERNAME] = username;
      return response;
    })
  );
}
const bitbucketApi = {
  get<P extends keyof ResponseMapGet>(path: P, options: Config) {
    return fetch<ResponseMapGet[P]>("GET", path, options);
  },
};
export default bitbucketApi;
