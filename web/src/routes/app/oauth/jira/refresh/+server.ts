import { JIRA_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_JIRA_CLIENT_ID } from "$env/static/public";
import { json } from "@sveltejs/kit";
import { z } from "zod";

export async function POST({ request }) {
  const data = z
    .object({ refreshToken: z.string() })
    .parse(await request.json());

  const response = await fetch("https://auth.atlassian.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: PUBLIC_JIRA_CLIENT_ID,
      client_secret: JIRA_CLIENT_SECRET,
      refresh_token: data.refreshToken,
    }),
  });
  if (response.ok) {
    const result = z
      .object({ access_token: z.string(), refresh_token: z.string() })
      .parse(await response.json());
    return json({
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
    });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
