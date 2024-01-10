export type UserResponse = {
  name: string;
  emailAddress: string;
  id: number;
  displayName: string;
  active: boolean;
  slug: string;
  type: string;
  links: { self: Array<{ href: string }> };
};
