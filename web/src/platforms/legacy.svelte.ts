import { providerFromConfig } from "$lib/streams/providers";
import { BehaviorSubject, map, retry, Subject } from "rxjs";
import type {
  AzureDevOpsConfig,
  BitbucketConfig,
  GitHubConfig,
  GitLabConfig,
  Platform,
  Progress,
  Task,
} from "./types";
import dripFlat from "$lib/services/dripFlat";
import type { PullRequestWithProject } from "$lib/models/Provider";
import type { Profile } from "$lib/models/Profile";

export default function legacy(
  config: GitHubConfig | GitLabConfig | AzureDevOpsConfig | BitbucketConfig,
): Platform {
  const provider = providerFromConfig(config);
  const progress$ = new BehaviorSubject(0);

  let progress: Progress = $state("init");
  let tasks: Task[] = $state([]);
  let currentProfile = $state<Profile | null>(null);

  const avatars: {
    medium: Record<string, string>;
    large: Record<string, string>;
  } = $state({ medium: {}, large: {} });

  function loadAvatar(profile: Profile, size: "medium" | "large") {
    let url = avatars[size][profile.id] ?? avatars[size]["large"];
    if (!url) {
      const subscription = provider.avatar(profile, size).subscribe((value) => {
        url = value;
        Promise.resolve().then(() => {
          avatars[size][profile.id] = value;
          subscription.unsubscribe();
        });
      });
    }
    return url;
  }

  const retry$ = new Subject<void>();
  const pullRequests$ = provider.projects().pipe(
    dripFlat(
      (project) =>
        provider.pullRequestsFor(project.id).pipe(
          map((prs) =>
            prs.map((pr) => ({
              pullRequest: pr,
              project,
              provider,
            })),
          ),
        ),
      progress$,
    ),
    retry({ delay: () => retry$ }),
  );

  $effect(() => {
    const subscription = provider.account().subscribe((value) => {
      currentProfile = value;
      Promise.resolve().then(() => {
        subscription.unsubscribe();
      });
    });
  });

  $effect(() => {
    if (!currentProfile) {
      return;
    }
    const subscriptions: { unsubscribe: () => void }[] = [];
    subscriptions.push(
      progress$.subscribe(($progress$) => {
        if (progress === "init" && $progress$ >= 0.99) {
          progress = "idle";
        }
      }),
    );
    subscriptions.push(
      pullRequests$.subscribe((prs) => {
        tasks = prs
          .filter(
            (pr) =>
              pr.pullRequest.creator.id === currentProfile?.id ||
              pr.pullRequest.reviewers.find(
                (r) => r.profile.id === currentProfile?.id,
              ),
          )
          .map(prToTask);
      }),
    );

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  });

  function prToTask({ pullRequest, project }: PullRequestWithProject): Task {
    return {
      id: `${pullRequest.id}`,
      url: pullRequest.url,
      title: pullRequest.title,
      attentionNeeded: false,
      timestamp: pullRequest.timestamp,
      author: {
        name: pullRequest.creator.name,
        getAvatar: (size) => loadAvatar(pullRequest.creator, size),
      },
      getGroup: () => project.name,
      getCollaborators() {
        return pullRequest.reviewers.map((reviewer) => ({
          name: reviewer.profile.name,
          getAvatar: (size) => loadAvatar(reviewer.profile, size),
          status: reviewer.status,
          icon: reviewer.icon === "APPROVED" ? "completed" : undefined,
        }));
      },
    };
  }

  return {
    get progress() {
      return progress;
    },
    refresh: () => {
      retry$.next();
      return Promise.resolve();
    },
    abort() {},
    get tasks() {
      return tasks;
    },
  };
}
