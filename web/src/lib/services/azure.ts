import { pluck } from "rxjs/operators";
import api from "./azure-api";

interface WithUrl {
  url: string;
}

export default {
  profile(organization: string, token: string, id = "me") {
    return api.get(
      "https://vssps.dev.azure.com/[organization]/_apis/profile/profiles/[id]",
      {
        params: { organization, id, "api-version": "5.1" },
        token,
      }
    );
  },
  avatar(
    organization: string,
    token: string,
    descriptor: string,
    size?: string // 'medium' | 'small' | 'large',
  ) {
    return api.get(
      "https://vssps.dev.azure.com/[organization]/_apis/graph/subjects/[descriptor]/avatars",
      {
        params: {
          organization,
          descriptor,
          size,
          "api-version": "6.0-preview.1",
        },
        token,
      }
    );
  },
  users(organization: string, token: string) {
    return api.get(
      "https://vssps.dev.azure.com/[organization]/_apis/graph/users",
      {
        params: {
          organization,
        },
        token,
      }
    );
  },
  projects(
    organization: string,
    token: string,
    params: { getDefaultTeamImageUrl?: boolean } = {}
  ) {
    return api
      .get("https://dev.azure.com/[organization]/_apis/projects", {
        params: { ...params, organization, "api-version": "5.1" },
        token,
      })
      .pipe(pluck("value"));
  },

  project(projectId: string, organization: string, token: string) {
    return api.get(
      "https://dev.azure.com/[organization]/_apis/projects/[projectId]",
      {
        params: { organization, projectId, "api-version": "5.1" },
        token,
      }
    );
  },

  pullRequests(projectId: string, organization: string, token: string) {
    return api
      .get(
        "https://dev.azure.com/[organization]/[projectId]/_apis/git/pullrequests",
        {
          params: { organization, projectId, "api-version": "5.1" },
          token,
        }
      )
      .pipe(pluck("value"));
  },

  extractOrganization(object: WithUrl) {
    if (typeof object.url !== "string") {
      console.warn(object);
      throw new Error(`Unable to extract organization`);
    }
    const match = object.url.match(/https:\/\/dev\.azure\.com\/([^/]+)/);
    if (match === null) {
      throw new Error(`Unable to extract organization from url: ${object.url}`);
    }
    return match[1];
  },
};
