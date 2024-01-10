import { omit } from "lodash-es";
import { ajax } from "rxjs/ajax";
import type { AjaxRequest } from "rxjs/ajax";
import { map } from "rxjs/operators";
import type { Observable } from "rxjs";
import buildUrl from "./buildUrl";
import type { UserResponse } from "./github-api-types/user-response";
import type { RepositoriesResponse } from "./github-api-types/repositories-response";
import type { PullRequestsResponse } from "./github-api-types/pull-requests-response";
import type { ReviewsResponse } from "./github-api-types/reviews-response";

interface Config extends Partial<AjaxRequest> {
  accessToken: string;
  params?: Record<string, unknown>;
}
type ResponseMapGet = {
  user: UserResponse;
  "user/repos": RepositoriesResponse;
  "repos/[owner]/[repo]/pulls": PullRequestsResponse;
  "repos/[owner]/[repo]/pulls/[number]/reviews": ReviewsResponse;
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
  const url = `https://api.github.com/${buildUrl(
    path,
    (config.params ?? {}) as Record<string, string>
  )}`;
  const request = omit(config, ["token", "params"]) as AjaxRequest;
  request.url = url;
  request.headers = {
    Accept: "application/vnd.github+json",
    // "X-Github-Api-Version": "2022-11-28",
    Authorization: `Bearer ${config.accessToken}`,
    ...(request.headers || {}),
  };
  return request;
}
function fetch<Response>(
  method: "GET",
  path: string,
  config: Config
): Observable<Response> {
  return ajax<any>(applyParams(path, { ...config, method })).pipe(
    map(({ response }) => response)
  );
}
const githubApi = {
  get<P extends keyof ResponseMapGet>(path: P, options: Config) {
    return fetch<ResponseMapGet[P]>("GET", path, options);
  },
};
export default githubApi;
