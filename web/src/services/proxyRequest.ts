import { dev } from "$app/environment";
import { PUBLIC_PROXY_DOMAIN } from "$env/static/public";

export default async function proxyRequest(
  url: string,
  init: RequestInit,
): Promise<Response> {
  if (dev) {
    return devProxyRequest(url, init);
  }
  throw new Error("not implemented");
}

async function devProxyRequest(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const proxyUrl = new URL(url);
  if (proxyUrl.origin !== PUBLIC_PROXY_DOMAIN) {
    throw new Error(
      `Unexpected origin:${proxyUrl.origin}, expecting: ${PUBLIC_PROXY_DOMAIN}`,
    );
  }
  proxyUrl.protocol = location.protocol;
  proxyUrl.host = location.host;
  proxyUrl.pathname = `/proxy${proxyUrl.pathname}`;
  const response = await fetch(proxyUrl.toString(), init);
  return response;
}
