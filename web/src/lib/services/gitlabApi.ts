import type { Observable } from "rxjs";
import type { AjaxRequest } from "rxjs/ajax";
import { omit } from "lodash-es";
import { combineLatest, of } from "rxjs";
import { ajax } from "rxjs/ajax";
import { map, switchMap } from "rxjs/operators";
import type { MergeRequestsResponse } from "./gitlab-api-types/merge-requests-response";
import type { ProjectsResponse } from "./gitlab-api-types/projects-response";
import type { UserResponse } from "./gitlab-api-types/user-response";
import buildUrl from "./buildUrl";

interface Config extends Partial<AjaxRequest> {
  token: string; // Private Token
  params?: Record<string, string | number>;
}
type ResponseMapGet = {
  "https://[domain]/api/v4/user": UserResponse;
  "https://[domain]/api/v4/projects": ProjectsResponse;
  "https://[domain]/api/v4/merge_requests": MergeRequestsResponse;
  "https://[domain]/api/v4/projects/[projectId]/merge_requests": MergeRequestsResponse;
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
    headers["Private-Token"] = config.token;
  }
  return request;
}
function fetch<Response>(
  method: "GET",
  path: string,
  config: Config,
): Observable<Response> {
  return ajax<Response>(applyParams(path, { ...config, method })).pipe(
    // page
    map(({ response }) => response),
  );
}
const gitlabApi = {
  get<P extends keyof ResponseMapGet>(path: P, options: Config) {
    return fetch<ResponseMapGet[P]>("GET", path, options);
  },
  paged<P extends keyof ResponseMapGet>(
    path: P,
    options: Config,
    perPage = 100,
  ): Observable<ResponseMapGet[P]> {
    const params = options.params ? { ...options.params } : {};
    params.per_page = perPage;
    params.page = 1;
    const config: Config = {
      method: "GET",
      ...options,
      params,
    };

    return ajax<any>(applyParams(path, config)).pipe(
      switchMap((response) => {
        const totalPagesHeader =
          response.xhr.getResponseHeader("x-total-pages");
        const pages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1;
        if (pages <= 1) {
          return of(response.response);
        }
        const requests: Observable<ResponseMapGet[P]>[] = [
          of(response.response),
        ];
        for (let i = 2; i <= pages; i += 1) {
          params.page = i;
          requests.push(gitlabApi.get(path, { ...config, params }));
        }
        return combineLatest(requests).pipe(map((results) => results.flat(1)));
      }),
    );
  },
};
export default gitlabApi;
