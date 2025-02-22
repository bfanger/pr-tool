import { JIRA_CLIENT_SECRET } from "$env/static/private";
import {
  PUBLIC_JIRA_CLIENT_ID,
  PUBLIC_JIRA_REDIRECT_URI,
} from "$env/static/public";
import { error } from "@sveltejs/kit";
import { z } from "zod";

export const prerender = false;
export const load = async ({ url, cookies }) => {
  const state = url.searchParams.get("state");
  if (state && state !== cookies.get("jira_client_state")) {
    error(400, "Invalid state");
  }

  const code = url.searchParams.get("code");
  if (code) {
    const response = await fetch("https://auth.atlassian.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: PUBLIC_JIRA_CLIENT_ID,
        client_secret: JIRA_CLIENT_SECRET,
        code,
        redirect_uri: PUBLIC_JIRA_REDIRECT_URI,
      }),
    });
    let data;
    if (response.headers.get("Content-Type")?.startsWith("application/json")) {
      data = await response.json();
    }
    if (!response.ok) {
      const result = z
        .object({ error: z.string(), error_description: z.string() })
        .safeParse(data);
      if (result.success) {
        return {
          accessToken: "",
          error: `[${result.data.error}] ${result.data.error_description}`,
        };
      }
      return { error: "Invalid code" };
    } else {
      const result = z
        .object({ access_token: z.string(), refresh_token: z.string() })
        .parse(data);
      if (result) {
        return {
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
        };
      }
    }
  }
  return { error: "Missing code" };
};
