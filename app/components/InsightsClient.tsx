"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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
  eventColor,
} from "@/lib/metrics";

// ── Component ─────────────────────────────────────────────────────────────

export default function InsightsClient({ data }: { data: DashboardData }) {
  const { team, members, weeklyMetrics, interactions, events } = data;
  const weekCount = team.weekLabels.length; // 6

  const [selectedWeek, setSelectedWeek] = useState(team.currentWeekIndex);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [isHighlighting, setIsHighlighting] = useState<boolean>(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isTableView, setIsTableView] = useState<boolean>(false);
  const [syncedMembers, setSyncedMembers] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const { weights } = useConfig();

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      setSelectedWeek(prev => {
        if (prev >= weekCount - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2500); // 2.5 seconds per week for demo
    return () => clearTimeout(timer);
  }, [isPlaying, selectedWeek, weekCount]);

  // Chat AI State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatState, setChatState] = useState<'idle' | 'typing' | 'done'>('idle');
  const [chatResponse, setChatResponse] = useState('');
  const [activePrompt, setActivePrompt] = useState('');

  const handlePromptClick = (prompt: string) => {
    setActivePrompt(prompt);
    setChatState('typing');
    setChatResponse('');
    setTimeout(() => {
      setChatState('done');
      if (prompt.includes('isolation')) {
        setChatResponse("Based on the network density metrics, the Design Pod is showing early signs of isolation. Cross-pod collaboration events have dropped by 30% over the last two weeks, and response lag for external requests is increasing.");
      } else {
        setChatResponse("The overall score drop in week 3 correlates with a significant reduction in 1:1 meetings across the backend team, combined with a slight dip in average self-reported mood scores.");
      }
    }, 1500);
  };

  const handleExportCSV = () => {
    const headers = "weekIndex,memberId,responseLagHours,meetingCount,moodScore\n";
    const rows = weeklyMetrics.map(m => 
      `${m.weekIndex},${m.memberId},${m.responseLagHours},${m.meetingCount},${m.moodScore === null ? '' : m.moodScore}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-pulse-metrics.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
  const allScores    = allWeekScores.map((r) => r.teamScore);

  // ── Events for selected or hovered week ─────────────────────────────────
  const displayWeek = hoveredWeek !== null ? hoveredWeek : selectedWeek;
  const weekEvents = events.filter((e) => e.weekIndex === displayWeek);

  // ── Async AI Insights ─────────────────────────────────────────────────────
  const [aiText, setAiText] = useState<string>("");
  const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchInsight = async () => {
      setIsLoadingInsight(true);
      try {
        const res = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamScore,
            currentLag: lag,
            currentMeetings: meetings,
            currentMood: mood,
          }),
        });
        const data = await res.json();
        if (isMounted && data.insight) {
          setAiText(data.insight);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setAiText("Failed to generate AI insight. Please try again.");
      } finally {
        if (isMounted) setIsLoadingInsight(false);
      }
    };

    fetchInsight();
    return () => { isMounted = false; };
  }, [teamScore, lag, meetings, mood]);

  const selectedMember = useMemo(() => 
    members.find(m => m.memberId === selectedMemberId), 
  [members, selectedMemberId]);

  // Close modal on Escape
  useEffect(() => {
    if (!selectedMemberId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMemberId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMemberId]);

  return (
    <div className="flex flex-col md:flex-row gap-[var(--spacing-xl)] relative items-start">
      
      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in">
          <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-[var(--color-success)] border border-[var(--color-success)]/30">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="text-sm font-medium">{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-2 text-inverse-on-surface/70 hover:text-inverse-on-surface transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-inverse-on-surface rounded-full"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Per-Person Detail Modal ── */}
      {selectedMember && (() => {
        const isSynced = syncedMembers.has(selectedMember.memberId);
        return (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedMemberId(null)}
          >
          <div 
            className="bg-surface-container w-full max-w-[420px] min-w-[300px] rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-outline-variant/30 flex flex-col gap-4 animate-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button 
              onClick={() => setSelectedMemberId(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close details"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                {selectedMember.initials}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-on-surface">{selectedMember.displayName}</h3>
                <p className="text-sm text-on-surface-variant">{selectedMember.role} • {selectedMember.pod} Pod</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-xs font-semibold text-on-surface uppercase tracking-wide">Privacy-Safe Insight</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Aggregated signal indicates <strong className="text-on-surface">engagement has dipped</strong> slightly in recent weeks. 
                Interaction with cross-functional pods is lower than baseline. 
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20 mt-2">
              <p className="text-xs font-medium text-on-surface-variant mb-1 uppercase tracking-wide">Suggested Action</p>
              <button 
                disabled={isSynced}
                onClick={() => {
                  setSyncedMembers(prev => new Set(prev).add(selectedMember.memberId));
                  setToastMessage(`1:1 sync suggested for ${selectedMember.displayName}`);
                  setTimeout(() => setToastMessage(null), 4000);
                  setSelectedMemberId(null);
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-md ${
                  isSynced 
                    ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed border border-outline-variant/20 shadow-none" 
                    : "bg-primary text-on-primary hover:bg-primary/90"
                }`}
              >
                {isSynced ? (
                  <>
                    <svg className="w-4 h-4 text-[var(--color-success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Sync Suggested
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Suggest 1:1 Sync
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── Left Sidebar (Mockup) ── */}
      <aside className="w-full md:w-56 shrink-0 flex flex-col gap-[var(--spacing-lg)] pb-8 md:sticky md:top-28 md:h-[calc(100vh-112px)] md:overflow-y-auto scrollbar-hide">
        {/* Pulse AI Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/30">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-on-surface text-sm">Pulse AI</h3>
            <p className="text-[11px] text-on-surface-variant">Supporting your team</p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex flex-col gap-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            Overview
          </Link>
          <button className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg bg-surface-container text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Engagement
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('card-collaboration-topology');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                setIsHighlighting(true);
                setTimeout(() => setIsHighlighting(false), 3000);
              }
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Collaboration
          </button>
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            AI Suggestions
          </button>
        </nav>

        {/* Action Button */}
        <div className="mt-auto pt-8">
          <button 
            onClick={handleExportCSV}
            className="w-full py-2.5 px-4 rounded-xl border border-outline-variant/50 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary">
            Export to CSV
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col gap-[var(--spacing-lg)] min-w-0">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Timeline & History View</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Review team health and engagement metrics over the past 6 weeks.
          </p>
        </div>

        {/* ── Timeline Scrubber ──────────────────────────────────────────── */}
        <section
          id="timeline-scrubber"
          className="glass-card rounded-2xl p-[var(--spacing-md)] flex flex-col gap-4"
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
                </svg>
                <h2 className="text-sm font-semibold text-on-surface tracking-wide uppercase">
                  Historical Context
                </h2>
              </div>
              <button
                onClick={() => {
                  if (!isPlaying && selectedWeek === weekCount - 1) {
                    setSelectedWeek(0);
                  }
                  setIsPlaying(!isPlaying);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  isPlaying 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-surface-container-high hover:bg-surface-variant text-on-surface-variant border border-outline-variant/30'
                }`}
              >
                {isPlaying ? (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    Pause Demo
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Auto-Play Demo
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  background: teamScore >= 80 ? "var(--color-success)" : teamScore >= 60 ? "var(--color-warning)" : "var(--color-error)",
                  color: teamScore >= 80 ? "var(--color-on-success)" : teamScore >= 60 ? "var(--color-on-warning)" : "var(--color-on-error)",
                }}
              >
                {team.weekLabels[selectedWeek]}
              </span>
              <span className="text-xs text-on-surface-variant">
                Score:{" "}
                <strong className="text-on-surface">{Math.round(allScores[selectedWeek] ?? 0)}</strong>
              </span>
            </div>
          </div>

          {/* Scrollable container for mobile */}
          <div className="overflow-x-auto pb-4 pt-2 -mb-4 -mt-2 scrollbar-hide">
            <div className="min-w-[600px] flex flex-col gap-4">
              {/* Nodes row — chevron separators, no overlapping rail */}
              <div className="flex items-center justify-between gap-0">
                {team.weekLabels.map((label, i) => {
                  const weekScore  = allScores[i] ?? 0;
                  const isSelected = i === selectedWeek;
                  const isPast     = i < selectedWeek;
                  const isCurrent  = i === team.currentWeekIndex;
                  const hasEvent   = events.some((e) => e.weekIndex === i);
                  const isLast     = i === weekCount - 1;

                  const arcColor =
                    weekScore >= 80 ? "var(--color-success)" : weekScore >= 60 ? "var(--color-warning)" : "var(--color-error)";
                  const r    = 16;
                  const circ = 2 * Math.PI * r;
                  const dashOffset = circ * (1 - weekScore / 100);

                  return (
                    <div key={i} className="flex items-center flex-1 min-w-0">
                      {/* ── Week button ── */}
                      <button
                        id={`week-btn-${i}`}
                        onClick={() => setSelectedWeek(i)}
                        onMouseEnter={() => setHoveredWeek(i)}
                        onMouseLeave={() => setHoveredWeek(null)}
                        aria-label={`Select ${label}, score ${Math.round(weekScore)}`}
                        aria-pressed={isSelected}
                        className="flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg flex-1 min-w-0 group"
                      >
                        {/* Arc node */}
                        <div className="relative mx-auto transition-transform duration-200 group-hover:scale-105" style={{ width: 64, height: 64 }}>
                          {isSelected && (
                            <span
                              className="absolute inset-0 rounded-full pulse-ring pointer-events-none"
                              style={{ background: arcColor, opacity: 0.12 }}
                            />
                          )}
                          <svg width="64" height="64" viewBox="0 0 64 64"
                            style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="32" cy="32" r="30" fill="none"
                              stroke={isSelected ? arcColor : "transparent"}
                              style={{ opacity: 0.15 }}
                              strokeWidth="2" />
                            <circle cx="32" cy="32" r={r} fill="none"
                              stroke="var(--color-outline-variant)" style={{ opacity: 0.2 }} strokeWidth="4" />
                            <circle cx="32" cy="32" r={r} fill="none"
                              stroke={isSelected || isPast ? arcColor : "var(--color-outline-variant)"}
                              strokeWidth="4"
                              strokeDasharray={circ}
                              strokeDashoffset={dashOffset}
                              strokeLinecap="round"
                              style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
                            />
                          </svg>
                          <span
                            className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                            style={{ color: isSelected ? arcColor : isPast ? arcColor : "var(--color-outline)", transition: "color 0.3s" }}
                          >
                            {Math.round(weekScore)}
                          </span>
                          {isCurrent && (
                            <span
                              className="absolute -top-1.5 -right-1.5 text-[7.5px] font-bold px-1.5 py-0.5 rounded-full leading-none shadow-sm"
                              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
                            >
                              NOW
                            </span>
                          )}
                          {hasEvent && (
                            <div className="absolute bottom-0 right-0 z-20">
                              <div className="p-1.5 -m-1.5">
                                <span
                                  className="block w-3.5 h-3.5 rounded-full border-[2.5px] border-surface-container-lowest"
                                  style={{
                                    background: eventColor(events.find((e) => e.weekIndex === i)?.type ?? ""),
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Label */}
                        <span
                          className="text-[10px] font-semibold tracking-wide leading-tight text-center truncate w-full px-1"
                          style={{ color: isSelected ? arcColor : isPast ? "#3f4848" : "#9faaaa", transition: "color 0.3s" }}
                        >
                          {label}
                        </span>
                      </button>

                      {/* ── Chevron connector (between nodes, never overlapping) ── */}
                      {!isLast && (
                        <svg
                          width="12" height="12" viewBox="0 0 12 12"
                          className="shrink-0 mx-0.5"
                          aria-hidden="true"
                        >
                          <polyline
                            points="3,2 9,6 3,10"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            stroke={isPast ? "#246565" : "rgba(159,170,170,0.5)"}
                            style={{ transition: "stroke 0.4s" }}
                          />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Detached seek bar — completely below all nodes ── */}
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(191,200,200,0.18)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((selectedWeek) / (weekCount - 1)) * 100}%`,
                background: "linear-gradient(90deg, #246565, #6aadad)",
              }}
            />
          </div>

          {/* Dynamic Events Panel */}
          <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-outline-variant/20">
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Events Context
            </span>
            {weekEvents.length > 0 ? (
              <div className="flex flex-col gap-3">
                {weekEvents.map((ev, idx) => (
                  <div key={idx} className="bg-surface-container/30 border border-outline-variant/30 rounded-xl p-3 flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-on-surface">{ev.title}</span>
                      <span
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{
                          background: `color-mix(in srgb, ${eventColor(ev.type)} 15%, transparent)`,
                          color: eventColor(ev.type),
                          border: `1px solid color-mix(in srgb, ${eventColor(ev.type)} 35%, transparent)`,
                        }}
                      >
                        {ev.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant/20 border-dashed rounded-xl p-4 text-center">
                <span className="text-xs font-medium text-on-surface-variant">No major events this week</span>
              </div>
            )}
          </div>
        </section>

        {/* ── Main Data Row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--spacing-md)]">
          
          {/* Collaboration Network (7 cols) */}
          <div
            id="card-collaboration-topology"
            className={`lg:col-span-7 glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col overflow-hidden ${isHighlighting ? 'pulse-ring' : ''}`}
          >
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
              <h2 className="text-xl font-medium text-on-surface">
                Collaboration Network
              </h2>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setIsTableView(!isTableView)}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  aria-label="Toggle between graph and table view for the collaboration network"
                >
                  {isTableView ? "View as graph" : "View as table"}
                </button>
                <span className="text-xs text-primary bg-primary/10 rounded-full px-3 py-1 font-medium border border-primary/20">
                  High Connectivity
                </span>
              </div>
            </div>

            <div
              id="card-graph-live"
              className="flex-grow relative rounded-lg overflow-hidden min-h-[360px]"
            >
              <GraphWrapper
                members={members}
                interactions={interactions}
                weekIndex={selectedWeek}
                onNodeClick={setSelectedMemberId}
                isTableView={isTableView}
              />
            </div>
          </div>

          {/* Hero Health Score (5 cols) */}
          <div
            id="card-team-health"
            className="lg:col-span-5 flex flex-col gap-[var(--spacing-md)]"
          >
            <div className="glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col flex-1">
              <div>
                <h2 className="text-xl font-medium text-on-surface mb-1">Team Health</h2>
                <p className="text-sm text-on-surface-variant leading-tight">
                  Aggregate psychological safety &amp; engagement.
                </p>
              </div>

              {/* Circular Score Ring */}
              <div className="flex flex-col items-center justify-center py-[var(--spacing-md)] flex-1 relative">
                <div className="w-56 h-56 rounded-full border-4 border-surface-container-high relative flex items-center justify-center">
                  <svg
                    className="absolute inset-0 w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                  >
                    {/* Track */}
                    <circle cx="50" cy="50" r="46" fill="none"
                      className="stroke-surface-container-high" strokeWidth="5" />
                    {/* Progress */}
                    <circle cx="50" cy="50" r="46" fill="none"
                      className={teamScore >= 80 ? "stroke-[var(--color-success)]" : teamScore >= 60 ? "stroke-[var(--color-warning)]" : "stroke-[var(--color-error)]"}
                      strokeWidth="5"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 rounded-full border border-primary/10 pulse-ring pointer-events-none" />
                  <div className="text-center z-10 flex flex-col items-center">
                    <span
                      className="font-bold tracking-tight text-on-surface"
                      style={{ fontSize: "56px", lineHeight: 1, letterSpacing: "-0.03em" }}
                    >
                      {scoreDisplay}
                    </span>
                    <span className="text-on-surface-variant text-lg font-medium mt-1">/ 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-panels for Trend and Burnout Risk */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--spacing-sm)]">
              <div className="bg-surface-container/50 border border-outline-variant/30 rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm font-medium text-on-surface-variant">Trend</span>
                <span className={`text-sm font-bold flex items-center gap-1 ${delta && delta >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {delta && delta >= 0 ? <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /> : <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />}
                    {delta && delta >= 0 ? <polyline points="17 6 23 6 23 12" /> : <polyline points="17 18 23 18 23 12" />}
                  </svg>
                  {delta && delta > 0 ? '+' : ''}{delta?.toFixed(1) || '0.0'} pts
                </span>
              </div>
              <div className="bg-surface-container/50 border border-outline-variant/30 rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm font-medium text-on-surface-variant">Burnout Risk</span>
                <span className={`text-sm font-bold ${teamScore >= 80 ? 'text-[var(--color-success)]' : teamScore >= 60 ? 'text-[var(--color-warning)]' : 'text-[var(--color-error)]'}`}>
                  {teamScore >= 80 ? 'Low' : teamScore >= 60 ? 'Medium' : 'High'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── AI Insights Row ─────────────────────────────────────────────── */}
        <div className="glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <div className="flex items-center gap-2 mb-3 pl-3">
            <svg className="w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <h2 className="text-lg font-medium text-on-surface">Pulse AI Observation</h2>
          </div>
          {isLoadingInsight ? (
            <div className="pl-3 pr-2 py-1 flex flex-col gap-2">
              <div className="w-full h-4 bg-surface-container-highest/50 rounded animate-pulse" />
              <div className="w-3/4 h-4 bg-surface-container-highest/50 rounded animate-pulse" />
            </div>
          ) : (
            <p className="text-sm text-on-surface leading-relaxed pl-3 font-medium animate-in fade-in duration-500">
              {aiText}
            </p>
          )}
        </div>

      </div>
      {/* ── Chat with Pulse AI Modal ── */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-surface-container w-full max-w-2xl rounded-3xl border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-modal-title"
          >
            {/* Header */}
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span id="chat-modal-title" className="font-semibold text-primary">Chat with Pulse AI</span>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                aria-label="Close Chat"
                className="p-2 text-on-surface-variant hover:text-on-surface transition-colors rounded-full hover:bg-surface-variant focus:outline-none focus:ring-2 focus:ring-primary">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-primary flex items-center justify-center text-on-primary">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="bg-surface-container-highest p-4 rounded-2xl rounded-tl-none border border-outline-variant/20 text-sm text-on-surface leading-relaxed max-w-[85%]">
                  Hello! I'm Pulse AI. I've analyzed the 6-week collaboration data for your team. I can help identify patterns in response lag, meeting frequency, and overall engagement. What would you like to know?
                </div>
              </div>
              
              {chatState !== 'idle' && (
                <>
                  <div className="flex gap-4 justify-end">
                    <div className="bg-primary p-4 rounded-2xl rounded-tr-none text-sm text-on-primary max-w-[85%]">
                      {activePrompt}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-primary flex items-center justify-center text-on-primary">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div className="bg-surface-container-highest p-4 rounded-2xl rounded-tl-none border border-outline-variant/20 text-sm text-on-surface leading-relaxed max-w-[85%]">
                      {chatState === 'typing' ? (
                        <div className="flex items-center gap-1.5 h-5" aria-label="Typing indicator">
                          <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce"></span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {chatResponse.split('\n\n').map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Prompts Footer */}
            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-high">
              <p className="text-xs font-semibold text-on-surface-variant mb-3 uppercase tracking-wider">Suggested Prompts</p>
              <div className="flex gap-2 flex-wrap">
                <button 
                  disabled={chatState === 'typing'}
                  onClick={() => handlePromptClick("Who is at risk of isolation?")} 
                  className="px-4 py-2 rounded-full border border-outline-variant/50 text-sm text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">
                  Who is at risk of isolation?
                </button>
                <button 
                  disabled={chatState === 'typing'}
                  onClick={() => handlePromptClick("Why did the score drop in week 3?")} 
                  className="px-4 py-2 rounded-full border border-outline-variant/50 text-sm text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">
                  Why did the score drop in week 3?
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
