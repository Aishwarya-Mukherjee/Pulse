# Product Requirements Document
## Team Pulse AI — Predicting Team Failures Before They Happen

**Track:** AI in Workplace (HR & Team Dynamics)
**Event:** VibeForge 1.0 — Online Round
**Version:** 1.0
**Last updated:** July 15, 2026

---

## 1. Overview

Team Pulse AI is a web application that analyzes non-private workplace collaboration signals (task update timing, meeting frequency, response times, and optional mood check-ins) to generate a **Team Health Score** and surface early warning signs of burnout, isolation, and communication breakdown — before they show up as resignations or missed deadlines.

Unlike productivity trackers, Team Pulse AI does not measure output. It measures the **health of collaboration itself**.

---

## 2. Problem Statement

Companies today can measure what people *produce* — tasks closed, attendance, hours logged — but have no reliable way to see relationship and collaboration health in real time. As a result, HR and team leads typically find out about burnout, isolation, or conflict only *after* the damage is visible: a resignation, a delayed project, a sudden drop in team performance. By then, the cost (rehiring, lost momentum, team morale) is already paid.

There is no lightweight, privacy-conscious tool that gives teams an early, visual signal of where collaboration is weakening.

---

## 3. Goals & Non-Goals

### 3.1 Goals (for this hackathon build)
- Demonstrate a working end-to-end pipeline: raw signals → computed health metrics → AI-generated insight → visual dashboard.
- Make the core idea understandable within 30 seconds of looking at the UI.
- Keep every claim the app makes traceable to a real, explainable calculation — no black-box scoring.
- Present insights at the **team/pair level**, not as individual surveillance.

### 3.2 Non-Goals (explicitly out of scope for this round)
- Real integrations with Slack, Jira, Google Calendar, etc. (data will be synthetic/simulated).
- Long-term historical trend storage or multi-team/org support.
- Authentication, roles, or multi-tenant infrastructure.
- Predicting named individual conflicts (ethically and technically out of scope — we surface *patterns*, not accusations).
- Mobile native apps (responsive web only).

---

## 4. Target Users

| User | What they need from the app |
|---|---|
| **Engineering/Team Manager** | A quick, visual read on whether their team's collaboration is healthy, and where to intervene. |
| **HR / People Ops** | Early, aggregate signals across teams without invasive individual monitoring. |
| **Hackathon Judges (primary audience for this build)** | A clear, working demo that shows meaningful AI use, clean UI/UX, and a real problem being solved — understandable without prior HR context. |

---

## 5. Core Concept: The Team Health Score

A composite score (0–100) per team, computed from normalized, weighted signals:

| Signal | What it captures | Data source (simulated) |
|---|---|---|
| Response Lag | Average delay between a message/task update and the next reply/action | Synthetic message/task timestamps |
| Meeting/1:1 Frequency | How often team members meet or sync, relative to baseline | Synthetic calendar events |
| Mood Check-in (optional) | Self-reported sentiment, 1–5 scale | Simple in-app input, anonymized/aggregated |

Formula (MVP): weighted average of normalized (0–1) signal scores, converted to 0–100.
Weights should be configurable constants in code (not hardcoded magic numbers) so they can be explained live to judges.

---

## 6. Features

### 6.1 MVP (must-ship)
1. **Synthetic Dataset** — a seeded ~12-person team, 4–6 weeks of simulated activity, with a deliberate story arc (one person's response time drifting up, one pair's interaction dropping off).
2. **Team Health Score Dashboard** — headline score + trend, updated as the simulated timeline progresses.
3. **Network Graph Visualization** — nodes = team members, edges = interaction strength, color-coded (green = healthy, amber = weakening, red = at risk). This is the hero visual.
4. **AI-Generated Insights Panel** — Claude API call takes the *computed metrics* (not raw data) and produces 2–3 natural-language observations/suggestions (e.g., "Communication between Priya and the design pod has dropped 40% over 2 weeks — consider a check-in.")
5. **Team-level privacy framing** — visible UI element/toggle stating insights are aggregated, not individual surveillance.
6. **Responsive layout** — works cleanly on both desktop and mobile viewport.

### 6.2 Stretch (only if MVP is done early)
- Timeline scrubber to replay the 4–6 week arc and watch the score/graph evolve.
- Per-person detail card (aggregated language, e.g. "Engagement trending down" rather than a labeled diagnosis).
- Simple "what would help" simulated action button (e.g., "schedule 1:1" → score nudges back up in the simulation) to show causality.
- Light/dark theme toggle.

### 6.3 Explicitly not building
- Individual conflict prediction with names attached.
- Any feature that could function as covert employee monitoring.
- Real third-party OAuth integrations.

---

## 7. User Flow

1. User lands on the dashboard → sees current Team Health Score and network graph immediately (no login/setup friction).
2. User can hover/click a node or edge → sees a short, aggregated explanation of why it's flagged.
3. User views the AI Insights panel → reads 2–3 generated, actionable observations.
4. (Stretch) User scrubs the timeline to see how the score evolved over the simulated weeks.

---

## 8. Technical Approach

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React (Vite) or Next.js | Next.js recommended if deploying to Vercel for simplicity |
| Visualization | D3.js (force-directed graph) or a simpler card/list fallback if time-constrained | Decide early — biggest time/payoff tradeoff in the build |
| Scoring logic | Plain JS/TS functions, no AI involved | Must be deterministic and explainable |
| AI Insights | Claude API (Sonnet), called server-side with computed metrics as input, structured JSON output | Never send raw "surveillance-style" data to the model — only aggregated metrics |
| Data | Static seeded JSON/CSV, generated once and committed to repo | No live backend/database needed for MVP |
| Hosting | Vercel | Deploy early, keep stable |
| Repo | Named exactly as team name per competition rules | All members should have visible commits |

---

## 9. Success Metrics (for this evaluation round)

Mapped directly to the stated judging criteria:

| Judging Criterion | How we address it |
|---|---|
| UI/UX Design | Single hero visual (network graph) + clean score/insight panels, minimal clutter |
| Responsiveness | Tested on desktop + mobile breakpoints before submission |
| Theme Integration | Directly targets HR/team-dynamics problem with a differentiated angle (prediction, not tracking) |
| Hosting & Deployment | Deployed on Vercel early, verified stable through evaluation window |
| Team Collaboration | Git history shows contributions from all members |
| Project Presentation | Scripted, timed demo video under 2 minutes |
| Optimization | Lightweight static data, no unnecessary backend calls, fast load |

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Scope creep (trying to build all 5 detection types) | MVP locked to 2–3 signals and 1 composite score; stretch list kept separate and optional |
| Looks like employee surveillance | Team-level framing throughout UI; explicit privacy note; no named individual "risk" labels |
| No real data available | Synthetic dataset with a clear, disclosed narrative arc; stated openly in demo, not hidden |
| AI use feels bolted-on | LLM is used specifically for language generation from real computed metrics, not for the underlying math |
| Demo video runs over 2 minutes | Script and time it before recording; rehearse at least twice |

---

## 11. Timeline (suggested, working backward from Aug 12)

| Phase | Focus |
|---|---|
| Week 1 | Finalize scope, build synthetic dataset, implement scoring logic |
| Week 2 | Build dashboard UI + network graph, wire up Claude API insights |
| Week 3 | Polish UI/UX, responsiveness pass, privacy framing, deploy to Vercel |
| Final days | Record and edit demo video, finalize README, confirm repo naming/contributions |

---

## 12. Open Questions

- Force-directed D3 graph vs. simpler visual — decide based on team's frontend bandwidth.
- Exact signal weighting for the Health Score — needs a sensible default, doesn't need to be "correct," just explainable.
- Whether to include the mood check-in as a third signal or keep it as a stretch feature.
