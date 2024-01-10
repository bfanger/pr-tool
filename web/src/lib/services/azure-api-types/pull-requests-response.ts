export type CreatedBy = {
  id: string;
  displayName: string;
  url: string;
  uniqueName: string;
  imageUrl: string;
  descriptor: string;
  _links: {
    avatar: {
      href: string;
    };
  };
};
export type Reviewer = {
  id: string;
  uniqueName: string;
  imageUrl: string;
  reviewerUrl: string;
  vote: 0;
  isFlagged: boolean;
  isRequired?: boolean;
  hasDeclined?: boolean;
  displayName: string;
  url: string;
  _links: {
    avatar: {
      href: string;
    };
  };
};
export type PullRequest = {
  repository: {
    id: string;
    name: string;
    url: string;
    project: {
      id: string;
      name: string;
      state: string;
      visibility: string;
      lastUpdateTime: string;
    };
  };
  pullRequestId: number;
  codeReviewId: number;
  status: string;
  createdBy: CreatedBy;
  creationDate: string;
  title: string;
  description: string;
  sourceRefName: string;
  targetRefName: string;
  mergeStatus: string;
  isDraft: false;
  mergeId: string;
  lastMergeSourceCommit: {
    commitId: string;
    url: string;
  };
  lastMergeTargetCommit: {
    commitId: string;
    url: string;
  };
  lastMergeCommit: {
    commitId: string;
    url: string;
  };
  reviewers: Reviewer[];
  url: string;
  supportsIterations: true;
};
export type PullRequestsResponse = {
  count: number;
  value: PullRequest[];
};
