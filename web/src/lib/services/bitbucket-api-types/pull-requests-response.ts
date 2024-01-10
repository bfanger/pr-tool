export type PullRequestsResponse = {
  size: number;
  limit: number;
  isLastPage: boolean;
  values: PullRequest[];
  start: number;
};
type PullRequest = {
  id: number;
  version: number;
  title: string;
  description: string;
  state: string;
  open: boolean;
  closed: boolean;
  createdDate: number;
  updatedDate: number;
  closedDate: number;
  fromRef: {
    id: string;
    displayId: string;
    latestCommit: string;
    repository: Repository;
  };
  toRef: {
    id: string;
    displayId: string;
    latestCommit: string;
    repository: Repository;
  };
  locked: boolean;
  author: Author;
  reviewers: Author[];
  participants: any[];
  properties: {
    qgStatus: string;
    resolvedTaskCount: number;
    commentCount: number;
    openTaskCount: number;
  };
  links: { self: Array<{ href: string }> };
};

type Author = {
  user: {
    name: string;
    emailAddress: string;
    id: number;
    displayName: string;
    active: boolean;
    slug: string;
    type: string;
    links: { self: Array<{ href: string }> };
  };
  role: string;
  approved: boolean;
  status: string;
  lastReviewedCommit?: string;
};

type Repository = {
  slug: string;
  id: number;
  name: string;
  scmId: string;
  state: string;
  statusMessage: string;
  forkable: boolean;
  project: {
    key: string;
    id: number;
    name: string;
    public: boolean;
    type: string;
    links: { self: Array<{ href: string }> };
  };
  public: boolean;
  links: {
    clone: Array<{ name: string; href: string }>;
    self: Array<{ href: string }>;
  };
};
