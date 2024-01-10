type User = {
  publicAlias?: string;
  displayName: string;
  url: string;
  descriptor: string;
  subjectKind: string;
  metaType?: string;
  domain: string;
  principalName: string;
  mailAddress: string;
  origin: string;
  originId?: string;
  _links: {
    self: {
      href: string;
    };
    memberships: {
      href: string;
    };
    membershipState: {
      href: string;
    };
    storageKey: {
      href: string;
    };
    avatar: {
      href: string;
    };
  };
};
export type UsersResponse = {
  count: number;
  value: User[];
};
