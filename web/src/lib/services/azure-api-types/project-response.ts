export type ProjectResponse = {
  id: string;
  name: string;
  description: string;
  url: string;
  state: string;
  revision: number;
  visibility: string;
  lastUpdateTime: string;

  _links: {
    self: {
      href: string;
    };
    collection: {
      href: string;
    };
    web: {
      href: string;
    };
  };
  defaultTeam: {
    id: string;
    name: string;
    url: string;
  };
};
