/* eslint-disable import/no-unresolved */
import { GITHUB_CLIENT_SECRET } from "$env/static/private";
import {
  PUBLIC_GITHUB_CLIENT_ID,
  PUBLIC_GITHUB_REDIRECT_URI,
} from "$env/static/public";

export const prerender = false;
export const load = async ({ url }) => {
  if (url.searchParams.has("code")) {
    const body = new FormData();
    body.append("client_id", PUBLIC_GITHUB_CLIENT_ID);
    body.append("code", url.searchParams.get("code"));
    body.append("redirect_uri", PUBLIC_GITHUB_REDIRECT_URI);
    body.append("client_secret", GITHUB_CLIENT_SECRET);
    const request = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      body,
    });
    const response = new URLSearchParams(await request.text());
    return {
      accessToken: response.get("access_token"),
      error: response.get("error_description") ?? response.get("error"),
    };
  }

  return { accessToken: "", error: "Missing code" };
};
