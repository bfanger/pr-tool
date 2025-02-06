## Goals

- Minimize the number of API calls
- Auto-healing (retry failed requests)

## Adapter

The new architecture should have an adapter to allow the old RxJS based providers to work until they are upgraded.

## Update strategy

### Refresh triggers

- Startup
- Network change
- Opening the popup

### Update triggers

Visible in viewport: 1...2 min

Based on rss with user filter: 1...5 min

Activity from user in the last week: 5...10 min refreshes

Backup:
1...2 hours refreshes
