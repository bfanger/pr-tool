import { map, publishReplay } from "rxjs/operators";
import type { ConnectableObservable } from "rxjs";
import configsStore from "../store/configs";
import AzureDevopsProvider from "../models/azure-devops/AzureDevopsProvider";
import type { AzureDevopsProviderAuth } from "../models/azure-devops/AzureDevopsProvider";
import GitlabProvider from "../models/gitlab/GitlabProvider";
import type { GitlabProviderAuth } from "../models/gitlab/GitlabProvider";
import BitbucketProvider from "../models/bitbucket/BitbucketProvider";
import type { BitbucketProviderAuth } from "../models/bitbucket/BitbucketProvider";
import type { Provider } from "../models/Provider";
import type { GithubProviderAuth } from "$lib/models/github/GithubProvider";
import GithubProvider from "$lib/models/github/GithubProvider";

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
      throw new Error(`Unsupported type: ${(config as any).type}`);
  }
}

const configs$ = configsStore.rx();
export const providersWithConfig$ = configs$.pipe(
  map((configs) => {
    return configs.map((config) => ({
      config,
      provider: providerFromConfig(config),
    }));
  }),
  publishReplay(1)
);
const connectable: ConnectableObservable<
  Array<{
    config: ProviderConfig;
    provider: Provider;
  }>
> = providersWithConfig$ as any;
connectable.connect();
const providers$ = providersWithConfig$.pipe(
  map((items) => items.map<Provider>(({ provider }) => provider))
);
export default providers$;
