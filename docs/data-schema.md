# Data Schema — Team Pulse AI Synthetic Dataset

This defines the exact shape of the synthetic dataset the app is built on. All data here is
fabricated for demo purposes — no real workplace data is used. Generate this once, save it as
a static JSON file (e.g. `/data/team-pulse-seed.json`), and commit it to the repo so the app
doesn't need a backend or live integrations.

---

## 1. Overview

- **Team size:** 12 members
- **Duration:** 6 weeks (`weekIndex` 0–5, where 0 = 6 weeks ago, 5 = current week)
- **Story arc to bake in deliberately:**
  - One member (`dev-04`) shows steadily rising `responseLagHours` and falling `meetingCount`
    from week 2 onward → simulates burnout risk.
  - One pair (`design-01` ↔ `dev-07`) shows `interactionStrength` dropping sharply after
    week 2 → simulates a forming silo / weak link.
  - Everyone else stays in a healthy, mildly noisy range → gives the dashboard a believable
    "mostly fine, a couple of real signals" baseline instead of everything flashing red.

---

## 2. Top-level structure

```json
{
  "team": { ... },
  "members": [ ... ],
  "weeklyMetrics": [ ... ],
  "interactions": [ ... ],
  "events": [ ... ]
}
```

---

## 3. `team` object

```json
{
  "team": {
    "teamId": "team-001",
    "teamName": "Product Engineering Pod",
    "currentWeekIndex": 5,
    "weekLabels": ["Week -6", "Week -5", "Week -4", "Week -3", "Week -2", "Week -1"]
  }
}
```

| Field | Type | Notes |
|---|---|---|
| `teamId` | string | Static identifier, only one team needed for MVP |
| `teamName` | string | Display name shown in the dashboard header |
| `currentWeekIndex` | number | Index of the most recent week (5 for a 6-week dataset) |
| `weekLabels` | string[] | Display labels for the timeline scrubber, index-aligned to `weekIndex` |

---

## 4. `members` array

One entry per person. Roles are just for display/labeling (matches the "PM / Dev1 / Des / QA"
style from the Stitch mockups) — keep it small and readable.

```json
{
  "memberId": "dev-04",
  "displayName": "Dev 4",
  "initials": "D4",
  "role": "Backend Engineer",
  "pod": "Platform"
}
```

| Field | Type | Notes |
|---|---|---|
| `memberId` | string | Unique, kebab-case, stable across all arrays below |
| `displayName` | string | Shown on hover/detail, keep generic/anonymized (no real names) |
| `initials` | string | Used inside network graph nodes |
| `role` | string | e.g. "PM", "Backend Engineer", "Designer", "QA" |
| `pod` | string | Sub-team grouping, optional but useful for "cross-pod" insights |

Generate 12 of these. Suggested mix: 1 PM, 2 Designers, 6 Developers, 2 QA, 1 Data/Analytics —
adjust freely, doesn't need to be exact.

---

## 5. `weeklyMetrics` array

One entry **per member per week** — this is the core time-series data the scoring function and
sparklines read from. 12 members × 6 weeks = 72 entries.

```json
{
  "memberId": "dev-04",
  "weekIndex": 3,
  "responseLagHours": 5.2,
  "meetingCount": 2,
  "moodScore": 3
}
```

| Field | Type | Range / Notes |
|---|---|---|
| `memberId` | string | Foreign key into `members` |
| `weekIndex` | number | 0–5 |
| `responseLagHours` | number | Avg hours between a message/task update and next reply. Healthy baseline ~1–3hrs; rising trend = risk signal |
| `meetingCount` | number | Meetings/1:1s attended that week. Healthy baseline ~4–8; sharp drop = risk signal |
| `moodScore` | number (1–5) | Optional self-reported check-in. 5 = great, 1 = struggling. Use `null` for weeks where the person skipped the check-in (keep it realistic — not everyone checks in every week) |

**Generation guidance:**
- Healthy members: `responseLagHours` 1.0–3.0 with small random noise, `meetingCount` 4–8, `moodScore` 3–5.
- `dev-04` (burnout arc): weeks 0–1 normal, then `responseLagHours` climbs to ~6–8hrs and `meetingCount` drops to 1–2 by week 5, `moodScore` drifts down to 2.
- Leave ~15–20% of `moodScore` entries as `null` across the dataset to reflect realistic non-response.

---

## 6. `interactions` array

One entry **per member pair per week** — this drives the network graph (edges) and the
pair-level "weak link" detection. You don't need every possible pair every week; only include
pairs that had any interaction that week (skip zero-interaction pairs entirely rather than
writing `0` rows).

```json
{
  "weekIndex": 3,
  "memberA": "design-01",
  "memberB": "dev-07",
  "interactionStrength": 0.25,
  "channel": "mixed"
}
```

| Field | Type | Notes |
|---|---|---|
| `weekIndex` | number | 0–5 |
| `memberA` / `memberB` | string | Order doesn't matter, but keep it consistent (e.g. alphabetical by memberId) to avoid duplicate reversed pairs |
| `interactionStrength` | number (0–1) | Normalized collaboration signal (combination of message frequency + shared meetings + task co-assignment, pre-computed into one number for simplicity). 0.7+ = strong, 0.4–0.7 = mild, below 0.4 = weak |
| `channel` | string | Optional flavor field: `"messages"`, `"meetings"`, `"tasks"`, or `"mixed"` |

**Generation guidance:**
- Give the PM strong (`0.7+`) interaction with most members most weeks — realistic hub pattern.
- `design-01` ↔ `dev-07`: start around `0.6` in week 0–1, decay to `0.2` by week 4–5.
- Keep the graph from being fully connected — most real teams have a handful of strong ties, several mild ones, and one or two weak/missing ones. That contrast is what makes the visualization readable.

---

## 7. `events` array (optional, powers the "Key Events in Range" list seen in the timeline mockup)

```json
{
  "weekIndex": 2,
  "title": "Sprint Planning Overhaul",
  "description": "Team moved from weekly to biweekly planning cadence.",
  "type": "process_change"
}
```

| Field | Type | Notes |
|---|---|---|
| `weekIndex` | number | Week the event occurred |
| `title` | string | Short label |
| `description` | string | One line, shown under the title |
| `type` | string | `"process_change"`, `"launch"`, `"restructure"`, or similar — used for icon selection in the UI |

2–4 events across the 6 weeks is plenty; use these to give the AI Insights panel something
concrete to reference (e.g. correlate the `dev-07` interaction drop with a real "Team
Restructure" event).

---

## 8. Derived values (computed at runtime, NOT stored in the seed file)

These are calculated by the scoring function from the raw data above — don't hardcode them:

- **Per-member Health Score** — normalized composite of `responseLagHours`, `meetingCount`, `moodScore`.
- **Team Health Score** — aggregate (e.g. weighted average) of all members' scores for the selected week.
- **Edge color (strong/mild/weak)** — derived directly from `interactionStrength` using the thresholds in section 6.
- **Trend arrows** — difference between `weekIndex` N and N-1 for any of the above.

Keeping these computed rather than stored means the timeline scrubber "just works" for any
week without needing pre-baked score snapshots.

---

## 9. Minimal example (2 members, 2 weeks) — for quick sanity-checking a generator script

```json
{
  "team": {
    "teamId": "team-001",
    "teamName": "Product Engineering Pod",
    "currentWeekIndex": 1,
    "weekLabels": ["Week -1", "Current"]
  },
  "members": [
    { "memberId": "pm-01", "displayName": "PM", "initials": "PM", "role": "Product Manager", "pod": "Core" },
    { "memberId": "dev-04", "displayName": "Dev 4", "initials": "D4", "role": "Backend Engineer", "pod": "Platform" }
  ],
  "weeklyMetrics": [
    { "memberId": "pm-01", "weekIndex": 0, "responseLagHours": 1.5, "meetingCount": 7, "moodScore": 4 },
    { "memberId": "pm-01", "weekIndex": 1, "responseLagHours": 1.7, "meetingCount": 6, "moodScore": 4 },
    { "memberId": "dev-04", "weekIndex": 0, "responseLagHours": 2.1, "meetingCount": 5, "moodScore": 3 },
    { "memberId": "dev-04", "weekIndex": 1, "responseLagHours": 6.4, "meetingCount": 2, "moodScore": 2 }
  ],
  "interactions": [
    { "weekIndex": 0, "memberA": "dev-04", "memberB": "pm-01", "interactionStrength": 0.75, "channel": "mixed" },
    { "weekIndex": 1, "memberA": "dev-04", "memberB": "pm-01", "interactionStrength": 0.4, "channel": "meetings" }
  ],
  "events": [
    { "weekIndex": 1, "title": "Sprint Deadline", "description": "Release crunch week for v1.2.", "type": "launch" }
  ]
}
```

---

## 10. Instructions for the generation agent

> Generate a full JSON file matching this schema with 12 members and 6 weeks (`weekIndex` 0–5)
> of `weeklyMetrics`, plus a realistic sparse `interactions` set (not all pairs, not all weeks).
> Bake in exactly the two story arcs described in Section 1 (dev-04 burnout drift, design-01/
> dev-07 silo formation) so the dashboard has something real to visualize and the AI Insights
> panel has something true to say. Keep all other members in healthy, mildly noisy ranges.
> Output as a single valid JSON file at `/data/team-pulse-seed.json`.
