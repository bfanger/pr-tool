/**
 * The proxy immitates the api of ajax from 'rxjs/ajax' but uses axios inside nodejs.
 * This allows the app to make requests that are not allowed with CORS
 */
import type { AxiosRequestConfig } from "axios";
import type { Observable} from "rxjs";
import type { AjaxRequest, AjaxResponse } from "rxjs/ajax";
import { defer,from } from "rxjs";
import { map } from "rxjs/operators";
import rpc from "./rpc";

export type ProxyResponse = Pick<
  AjaxResponse<any>,
  "status" | "response" | "xhr"
>;
export default function proxy(request: AjaxRequest): Observable<ProxyResponse> {
  const options: AxiosRequestConfig = {
    url: request.url,
    method: request.method as AxiosRequestConfig["method"],
    headers: request.headers,
  };
  return defer(() =>
    from(rpc.send("axios", options)).pipe(
      map((res) => {
        const response: ProxyResponse = {
          status: res.status,
          response: res.body,
          xhr: {
            getResponseHeader(header: string) {
              return res.headers[header];
            },
          } as XMLHttpRequest,
        };
        return response;
      }),
    ),
  );
}
