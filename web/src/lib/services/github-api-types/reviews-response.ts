/**
 * How the author is associated with the repository.
 */
type AuthorAssociation =
  | "COLLABORATOR"
  | "CONTRIBUTOR"
  | "FIRST_TIMER"
  | "FIRST_TIME_CONTRIBUTOR"
  | "MANNEQUIN"
  | "MEMBER"
  | "NONE"
  | "OWNER";
export type ReviewsResponse = PullRequestReview[];

/**
 * Pull Request Reviews are reviews on pull requests.
 */
type PullRequestReview = {
  /**
   * Unique identifier of the review
   */
  id: number;
  node_id: string;
  user: null | SimpleUser;
  /**
   * The text of the review.
   */
  body: string;
  state: string;
  html_url: string;
  pull_request_url: string;
  _links: {
    html: {
      href: string;
      [k: string]: unknown;
    };
    pull_request: {
      href: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  submitted_at?: string;
  /**
   * A commit SHA for the review. If the commit object was garbage collected or forcibly deleted, then it no longer exists in Git and this value will be `null`.
   */
  commit_id: string | null;
  body_html?: string;
  body_text?: string;
  author_association: AuthorAssociation;
  [k: string]: unknown;
};
/**
 * A GitHub user.
 */
type SimpleUser = {
  name?: string | null;
  email?: string | null;
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  starred_at?: string;
  [k: string]: unknown;
};
