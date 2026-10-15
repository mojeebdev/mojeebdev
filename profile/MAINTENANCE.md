# Profile maintenance

Self-contained SVGs, system monospace fonts and CSS animation. No JavaScript, remote images or external fonts run in the README. The portrait uses 2,600 points.

## Cloud updates

The workflow runs on relevant pushes, manually from Actions, and Mondays at 08:15 UTC (09:15 Lagos). It uses GitHub's temporary built-in token, with no personal access token or user-created Actions secret. No token is committed. The snake generator is our own standard-library Python code.

If the API fails, the job stops before replacing outputs. The last successful profile remains visible. GitHub image caching can delay refreshes; scheduled workflows may be disabled after prolonged repository inactivity.

## Metric definitions

- Contributions: GitHub's default trailing-year calendar, as visible to the workflow token. This may exclude private activity.
- Public repos: public repositories owned by this account.
- Active days: dates with at least one contribution in the calendar.
- Longest streak: consecutive active days within this calendar, not an all-time streak.
- Track record: 40+ builds, 12+ years Web2 and 4+ years Web3 are self-reported figures from the prior profile.
- The snake visits every calendar cell along a continuous closed route. The board pads to an even number of columns to close the route. Cells fade after being eaten and grow back. Reduced-motion mode shows a static calendar and assembled portrait.

## Local update

Install Python 3, Git and GitHub CLI. Authenticate once with `gh auth login`.

```sh
git clone https://github.com/mojeebdev/mojeebdev.git
cd mojeebdev
bash profile/update.sh
```

The script obtains a token using `gh auth token` for the generator process only. It requires a clean checkout, fast-forwards, generates assets, commits only changed output and pushes.

Reproduce a verified snapshot without fetching new stats:

```sh
python3 profile/generate.py --snapshot profile/stats.json
```

## Change portrait

```sh
python3 -m pip install Pillow numpy
python3 profile/portrait.py profile/avatar.png
```

The default silhouette was hand-traced for this avatar. For another photo, supply a matching white-subject/black-background mask with `--mask mask.png`, or edit the polygon. Commit the photo and dots first; then run update.sh from the clean checkout.

## Optional local schedules

Use either the cloud schedule or one local schedule, not both. Local schedules use the machine's timezone.

Linux cron (ensure Git, gh and Python are in PATH):

```cron
15 9 * * 1 /bin/bash /absolute/path/mojeebdev/profile/update.sh >> /absolute/path/profile-update.log 2>&1
```

macOS: create `~/Library/LaunchAgents/xyz.mojeeb.profile.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>xyz.mojeeb.profile</string>
  <key>ProgramArguments</key><array>
    <string>/bin/bash</string><string>/absolute/path/mojeebdev/profile/update.sh</string>
  </array>
  <key>EnvironmentVariables</key><dict>
    <key>PATH</key><string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
  </dict>
  <key>StartCalendarInterval</key><dict>
    <key>Weekday</key><integer>1</integer>
    <key>Hour</key><integer>9</integer>
    <key>Minute</key><integer>15</integer>
  </dict>
</dict></plist>
```

Replace the absolute path, then run:

```sh
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/xyz.mojeeb.profile.plist
```

Windows Task Scheduler: create a weekly Monday task at 09:15, running Git Bash's bash.exe with arguments `-lc 'cd /c/absolute/path/mojeebdev && bash profile/update.sh'`. Use the same account that authenticated gh, and ensure gh and Python are available in Git Bash. Enable "Run task as soon as possible after a scheduled start is missed."

## Publish the reviewed branch

```sh
git fetch origin
git switch main
git pull --ff-only
git merge --ff-only origin/profile-terminal-upgrade
git push origin main
```

Or merge the profile upgrade pull request on GitHub. If main has diverged, use the pull request instead of force-pushing.
