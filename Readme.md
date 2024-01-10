# Desktop Utility that shows PR status

## Links

- [Production](https://pr.bfanger.nl/)
- [Bitbucket REST api](https://docs.atlassian.com/bitbucket-server/rest/7.7.1/bitbucket-rest.html)
- [Azure DevOps API](https://docs.microsoft.com/en-us/rest/api/azure/devops/git/pull%20requests/get%20pull%20requests%20by%20project?view=azure-devops-rest-5.1)
- [App Setting in Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/quickStartType//sourceType/Microsoft_AAD_IAM/appId/2edb3d23-0340-4c39-9eea-84820ecd9120/objectId/4f2f5d91-cfa0-4fc0-9bbc-d3265827e2ed/isMSAApp//defaultBlade/Overview/servicePrincipalCreated/true)
- [App Settings in VisualStudio](https://app.vsaex.visualstudio.com/app/view?clientId=11636132-222f-4092-9bdb-c454b3e2f773)

https://docs.microsoft.com/en-us/graph/api/overview
https://docs.microsoft.com/en-us/graph/permissions-reference
https://stackoverflow.com/questions/57310344/how-do-i-use-avatar-image-urls-from-the-azure-devops-api
https://docs.microsoft.com/en-us/rest/api/azure/devops/graph/avatars/get?view=azure-devops-rest-5.1

## Setup

To speedup the yarn install set the `ELECTRON_MIRROR` to the faster chinese mirror instead of the default github one.

```sh
export ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/"
```

## Setting up Desktop app

```
brew install entr
yarn install
yarn build:electron
open out/
```
