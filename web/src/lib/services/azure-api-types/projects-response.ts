export type ProjectsResponse = {
  count: number;
  value: {
    id: string;
    name: string;
    description?: string;
    url: string;
    state: string;
    revision: number;
    visibility: string;
    lastUpdateTime: string;
    defaultTeamImageUrl?: string; // Depends on the getDefaultTeamImageUrl parameter
  }[];
};
