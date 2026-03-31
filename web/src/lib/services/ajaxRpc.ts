/**
 * The proxy imitates the api of ajax from 'rxjs/ajax' but uses axios inside nodejs.
 * This allows the app to make requests that are not allowed with CORS
 */
import type { Observable } from "rxjs";
import type { AjaxRequest, AjaxResponse } from "rxjs/ajax";
import { defer, from } from "rxjs";
import { map } from "rxjs/operators";
import rpc from "./rpc";

export type ProxyResponse = Pick<
  AjaxResponse<any>,
  "status" | "response" | "xhr"
>;
export default function ajaxRpc(
  request: AjaxRequest,
): Observable<ProxyResponse> {
  const options: { url: string } & RequestInit = {
    url: request.url,
    method: request.method,
    headers: request.headers,
  };
  return defer(() =>
    from(rpc.send("fetch", options)).pipe(
      map((res) => {
        const headers = new Headers(res.headers);
        const response: ProxyResponse = {
          status: res.status,
          response: res.body,
          xhr: {
            getResponseHeader: (name) => headers.get(name),
          } as XMLHttpRequest,
        };
        return response;
      }),
    ),
  );
}
