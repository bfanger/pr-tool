export type ProjectsResponse = {
  size: number;
  limit: number;
  isLastPage: boolean;
  start: number;
  values: Project[];
};

type Project = {
  key: string;
  id: number;
  name: string;
  description?: string;
  public: boolean;
  type: string;
  links: { self: Array<{ href: string }> };
};
