import type { ConnectableObservable } from "rxjs";
import { map, publishReplay } from "rxjs/operators";
import type { GithubProviderAuth } from "$lib/models/github/GithubProvider";
import GithubProvider from "$lib/models/github/GithubProvider";
import type { AzureDevopsProviderAuth } from "../models/azure-devops/AzureDevopsProvider";
import type { BitbucketProviderAuth } from "../models/bitbucket/BitbucketProvider";
import type { GitlabProviderAuth } from "../models/gitlab/GitlabProvider";
import type { Provider } from "../models/Provider";
import AzureDevopsProvider from "../models/azure-devops/AzureDevopsProvider";
import BitbucketProvider from "../models/bitbucket/BitbucketProvider";
import GitlabProvider from "../models/gitlab/GitlabProvider";
import configsStore from "../store/configs";
import { CompatProvider } from "$lib/services/CompatProvider";

type AzureDevopsProviderConfig = {
  type: "azure-devops";
  auth: AzureDevopsProviderAuth;
};
type GitlabProviderConfig = {
  type: "gitlab";
  auth: GitlabProviderAuth;
};
type BitbucketProviderConfig = {
  type: "bitbucket";
  auth: BitbucketProviderAuth;
};
type GithubProviderConfig = {
  type: "github";
  auth: GithubProviderAuth;
};
export type ProviderConfig =
  | AzureDevopsProviderConfig
  | GitlabProviderConfig
  | BitbucketProviderConfig
  | GithubProviderConfig;

export function providerFromConfig(config: ProviderConfig): Provider {
  switch (config.type) {
    case "azure-devops":
      return new AzureDevopsProvider(config.auth);
    case "gitlab":
      return new GitlabProvider(config.auth);
    case "bitbucket":
      return new BitbucketProvider(config.auth);
    case "github":
      return new GithubProvider(config.auth);
    default:
      return new CompatProvider(config);
  }
}

const configs$ = configsStore.rx();
export const providersWithConfig$ = configs$.pipe(
  map((configs) =>
    configs.map((config) => ({
      config,
      provider: providerFromConfig(config),
    })),
  ),
  publishReplay(1),
);
const connectable: ConnectableObservable<
  {
    config: ProviderConfig;
    provider: Provider;
  }[]
> = providersWithConfig$ as any;
connectable.connect();
const providers$ = providersWithConfig$.pipe(
  map((items) => items.map<Provider>(({ provider }) => provider)),
);
export default providers$;
