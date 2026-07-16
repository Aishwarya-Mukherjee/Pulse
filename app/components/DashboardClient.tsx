"use client";

import { useState, useEffect, useMemo } from "react";
import GraphWrapper from "./GraphWrapper";
import { useConfig } from "@/app/contexts/ConfigContext";
import {
  computeTeamHealthScore,
  computeAllWeekScores,
  computeWeekDelta,
  type WeeklyMetric,
  type TeamHealthResult,
} from "@/lib/scoring";

import {
  type Member,
  type Interaction,
  type TeamEvent,
  type TeamMeta,
  type DashboardData,
} from "@/lib/types";
import {
  CIRCUMFERENCE,
  scoreToOffset,
  avgLag,
  avgMeetings,
  avgMood,
  moodLabel,
  meetingLabel,
  toSparkPoints,
  toBarHeights,
} from "@/lib/metrics";

// ── Component ─────────────────────────────────────────────────────────────

export default function DashboardClient({ data }: { data: DashboardData }) {
  const { team, members, weeklyMetrics, interactions, events } = data;
  const weekCount = team.weekLabels.length; // 6

  const [selectedWeek, setSelectedWeek] = useState(team.currentWeekIndex);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTableView, setIsTableView] = useState<boolean>(false);
  const { weights } = useConfig();

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('welcomeShown')) {
      setShowWelcome(true);
    }
  }, []);

  // ── Scoring ─────────────────────────────────────────────────────────────
  const allWeekScores: TeamHealthResult[] = useMemo(
    () => computeAllWeekScores(weeklyMetrics, weekCount, weights),
    [weeklyMetrics, weekCount, weights]
  );

  const current = useMemo(
    () => computeTeamHealthScore(weeklyMetrics, selectedWeek, weights),
    [weeklyMetrics, selectedWeek, weights]
  );

  const delta = useMemo(
    () => computeWeekDelta(weeklyMetrics, selectedWeek, weights),
    [weeklyMetrics, selectedWeek, weights]
  );

  const teamScore      = current.teamScore;
  const scoreDisplay   = Math.round(teamScore);
  const strokeOffset   = scoreToOffset(teamScore);

  const statusLabel =
    teamScore >= 80 ? "Healthy" : teamScore >= 60 ? "Stable" : "At Risk";
  const statusColor =
    teamScore >= 80 ? "text-[var(--color-success)]" : teamScore >= 60 ? "text-[var(--color-warning)]" : "text-[var(--color-error)]";

  const deltaLabel =
    delta === null
      ? ""
      : delta > 0
      ? `▲ ${Math.abs(delta).toFixed(1)} vs prev week`
      : delta < 0
      ? `▼ ${Math.abs(delta).toFixed(1)} vs prev week`
      : "No change vs prev week";

  // ── Metric values for selected week ────────────────────────────────────
  const lag      = avgLag(weeklyMetrics, selectedWeek);
  const meetings = avgMeetings(weeklyMetrics, selectedWeek);
  const mood     = avgMood(weeklyMetrics, selectedWeek);

  // ── Sparkline data (all weeks, for the charts) ─────────────────────────
  const allLags      = team.weekLabels.map((_, i) => avgLag(weeklyMetrics, i));
  const allMeetings  = team.weekLabels.map((_, i) => avgMeetings(weeklyMetrics, i));
  const allMoods     = team.weekLabels.map((_, i) => avgMood(weeklyMetrics, i) ?? 0);
  const allScores    = allWeekScores.map((r) => r.teamScore);

  const lagSparkPts    = toSparkPoints(allLags, true); // invert: lower lag = better = higher on chart
  const moodSparkPts   = toSparkPoints(allMoods);
  const meetingBars    = toBarHeights(allMeetings);

  // ── Events for selected week ────────────────────────────────────────────
  const weekEvents = events.filter((e) => e.weekIndex === selectedWeek);

  return (
    <>
      {/* ── Top Bento Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[var(--spacing-md)] animate-in">

        {/* Hero Health Score (4 cols) */}
        <div
          id="card-team-health"
          className="md:col-span-4 glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div>
            <h2 className="text-2xl font-medium text-on-surface mb-1">Team Health</h2>
            <p className="text-sm text-on-surface-variant">
              Overall wellness &amp; connectivity
            </p>
          </div>

          {/* Circular Score Ring */}
          <div className="flex flex-col items-center justify-center py-[var(--spacing-lg)] relative">
            <div className="w-48 h-48 rounded-full border-4 border-surface-container-high relative flex items-center justify-center">
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                {/* Track */}
                <circle cx="50" cy="50" r="46" fill="none"
                  className="stroke-surface-container-high" strokeWidth="8" />
                {/* Progress */}
                <circle cx="50" cy="50" r="46" fill="none"
                  className={teamScore >= 80 ? "stroke-[var(--color-success)]" : teamScore >= 60 ? "stroke-[var(--color-warning)]" : "stroke-[var(--color-error)]"}
                  strokeWidth="8"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 rounded-full border border-primary/20 pulse-ring" />
              <div className="text-center z-10 flex flex-col items-center">
                <span
                  className="font-bold tracking-tight text-on-surface"
                  style={{ fontSize: "48px", lineHeight: 1.1, letterSpacing: "-0.02em" }}
                >
                  {scoreDisplay}
                  <span className="text-on-surface-variant text-2xl font-normal">/100</span>
                </span>
              </div>
            </div>
          </div>

          {/* Status Chip */}
          <div className="bg-primary-container/10 border border-primary/20 rounded-lg p-[var(--spacing-xs)] flex items-start gap-3">
            <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            <div>
              <p className={`text-sm font-semibold ${statusColor}`}>{statusLabel}</p>
              {deltaLabel && (
                <p className="text-xs font-medium text-on-surface-variant">{deltaLabel}</p>
              )}
            </div>
          </div>
        </div>

        {/* Collaboration Topology (5 cols) */}
        <div
          id="card-collaboration-topology"
          className="md:col-span-5 glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-medium text-on-surface">
              Collaboration Topology
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTableView(!isTableView)}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Toggle between graph and table view for the collaboration network"
              >
                {isTableView ? "View as graph" : "View as table"}
              </button>
              <span className="text-xs text-on-surface-variant bg-surface-container rounded-full px-3 py-1 font-medium">
                {team.weekLabels[selectedWeek]}
              </span>
            </div>
          </div>

          <div
            id="card-graph-live"
            className="flex-grow relative rounded-lg overflow-hidden min-h-[320px]"
          >
            <GraphWrapper
              members={members}
              interactions={interactions}
              weekIndex={selectedWeek}
              isTableView={isTableView}
            />
          </div>
        </div>

        {/* AI Insights (3 cols) — static placeholder, skipped per roadmap */}
        <div
          id="card-ai-insights"
          className="md:col-span-3 glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200"
        >
          <div className="flex items-center gap-2 mb-[var(--spacing-md)]">
            <svg className="w-5 h-5 text-secondary shrink-0" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18h6M10 22h4M12 2v2M12 6a6 6 0 0 1 6 6c0 2.5-1.5 4.7-3.5 5.7L14 22h-4l-.5-2.3C7.5 18.7 6 16.5 6 14A6 6 0 0 1 12 6Z" />
            </svg>
            <h2 className="text-2xl font-medium text-on-surface">AI Insights</h2>
          </div>
          <div className="flex flex-col gap-[var(--spacing-xs)] flex-grow">
            {[
              "Consider a sync between QA and Dev1 — collaboration signals have dropped over the past 2 weeks.",
              "Design pod is highly connected this sprint. Good momentum for the upcoming release.",
              "Backend team response time improved 18% vs last sprint. Momentum is strong.",
            ].map((text, i) => (
              <div key={i}
                className="bg-surface-container-low/50 rounded-lg p-[var(--spacing-xs)] border border-outline-variant/30 flex items-start gap-3">
                <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <p className="text-sm text-on-surface-variant">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Privacy Banner ─────────────────────────────────────────────── */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-[var(--spacing-md)] py-[var(--spacing-xs)] flex items-center justify-center gap-2 text-outline">
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p className="text-xs font-medium">
          Team-level insights only. No individual monitoring or surveillance.
        </p>
      </div>

      {/* ── Bottom Row — 3 Live Metric Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-md)] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">

        {/* Response Time */}
        <div id="card-response-time"
          className="glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xs font-medium text-on-surface-variant tracking-wide uppercase">
                Avg Response Time
              </h3>
              <p className="text-2xl font-medium text-on-surface mt-1">
                {lag.toFixed(1)} hrs
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {lag <= 2 ? "Fast ✓" : lag <= 4 ? "Moderate" : "Slow — risk signal ⚠"}
              </p>
            </div>
            <span className="text-secondary bg-secondary-container/20 p-2 rounded-lg">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
          </div>
          {/* Sparkline — all-week avg lag, inverted (lower = better = higher line) */}
          <div className="h-12 w-full mt-auto relative">
            <svg className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none" viewBox="0 0 100 30" aria-hidden="true">
              <polyline
                points={lagSparkPts}
                fill="none"
                stroke="var(--color-secondary)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              {/* Dot for selected week */}
              {lagSparkPts && (() => {
                const pts = lagSparkPts.split(" ").map((p) => p.split(",").map(Number));
                const pt = pts[selectedWeek];
                if (!pt) return null;
                return (
                  <circle cx={pt[0]} cy={pt[1]} r="3" fill="var(--color-secondary)" />
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Meeting Frequency */}
        <div id="card-meeting-frequency"
          className="glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xs font-medium text-on-surface-variant tracking-wide uppercase">
                Avg Meetings / Week
              </h3>
              <p className="text-2xl font-medium text-on-surface mt-1">
                {meetings.toFixed(1)}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {meetingLabel(meetings)}
              </p>
            </div>
            <span className="text-tertiary bg-tertiary-container/20 p-2 rounded-lg">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
          </div>
          {/* Bar chart — all 6 weeks */}
          <div className="h-12 w-full mt-auto flex items-end gap-1">
            {meetingBars.map((h, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedWeek(idx)}
                aria-label={`Select Week ${idx + 1}`}
                aria-pressed={selectedWeek === idx}
                className={[
                  "flex-1 rounded-t transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary",
                  idx === selectedWeek ? "bg-tertiary" : "bg-tertiary/40",
                ].join(" ")}
                style={{ height: `${Math.max(h * 100, 8)}%` }}
              />
            ))}
          </div>
        </div>

        {/* Team Sentiment */}
        <div id="card-team-sentiment"
          className="glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xs font-medium text-on-surface-variant tracking-wide uppercase">
                Team Sentiment
              </h3>
              <p className="text-2xl font-medium text-on-surface mt-1">
                {moodLabel(mood)}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {mood !== null
                  ? `Avg mood ${mood.toFixed(1)} / 5`
                  : "No check-ins this week"}
              </p>
            </div>
            <span className="text-primary bg-primary-container/20 p-2 rounded-lg">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </span>
          </div>
          {/* Sparkline — mood across all weeks */}
          <div className="h-12 w-full mt-auto relative">
            <svg className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none" viewBox="0 0 100 30" aria-hidden="true">
              <polyline
                points={moodSparkPts}
                fill="none"
                stroke="var(--color-primary)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              {moodSparkPts && (() => {
                const pts = moodSparkPts.split(" ").map((p) => p.split(",").map(Number));
                const pt = pts[selectedWeek];
                if (!pt) return null;
                return (
                  <circle cx={pt[0]} cy={pt[1]} r="3" fill="var(--color-primary)" />
                );
              })()}
            </svg>
          </div>
        </div>
      </div>
      
      {/* ── Hackathon Judge Welcome Modal ── */}
      {showWelcome && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-modal-title"
        >
          <div className="bg-surface-container w-full rounded-3xl border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col animate-in" style={{ maxWidth: '512px', minWidth: '300px' }}>
            <div className="p-6 pb-2">
              <h2 id="welcome-modal-title" className="text-xl font-semibold text-primary mb-2 tracking-tight">Welcome to Team Pulse AI</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Thank you for evaluating our hackathon project! Team Pulse AI is designed to predict team burnout and isolation <i>before</i> they lead to resignations.
              </p>
            </div>
            
            <div className="p-6 pt-4 pb-4 space-y-4 text-sm text-on-surface">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-0.5"><span className="text-xs font-bold">1</span></div>
                <p><strong>Configurable Engine:</strong> Click the <b>Settings icon</b> (top right) to tweak the live algorithm weights.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 shrink-0 rounded-full bg-secondary/20 flex items-center justify-center text-secondary mt-0.5"><span className="text-xs font-bold">2</span></div>
                <p><strong>Predictive Alerts:</strong> Click the <b>Bell icon</b> (top right) to see how the system surfaces early warning signs.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 shrink-0 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary mt-0.5"><span className="text-xs font-bold">3</span></div>
                <p><strong>Pulse AI Chat:</strong> Head over to the <b>Insights page</b> and click <i>AI Suggestions</i> to chat with the simulated LLM.</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-outline-variant/30 bg-surface-container-high flex justify-end">
              <button 
                onClick={() => {
                  setShowWelcome(false);
                  sessionStorage.setItem('welcomeShown', 'true');
                }}
                className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-medium text-sm hover:bg-primary-container transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-high">
                Start Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
