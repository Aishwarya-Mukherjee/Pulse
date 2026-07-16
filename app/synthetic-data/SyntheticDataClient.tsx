"use client";

import { useState, useEffect, useMemo } from "react";
import seed from "@/data/team-pulse-seed.json";
import { generateMemberInsight } from "@/lib/metrics";
import { useConfig } from "@/app/contexts/ConfigContext";
import type { WeeklyMetric } from "@/lib/scoring";
import type { Interaction } from "@/lib/types";

export default function SyntheticDataClient() {
  const { insightTone } = useConfig();
  const [selectedMemberId, setSelectedMemberId] = useState(seed.members[0].memberId);
  const [selectedWeek, setSelectedWeek] = useState(5); // Default to Week 5

  const [responseLagHours, setResponseLagHours] = useState(0);
  const [meetingCount, setMeetingCount] = useState(0);
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  
  // Storage Keys
  const storageKey = `synthetic-data-edits:${selectedMemberId}:${selectedWeek}`;
  const interactionsStorageKey = `synthetic-data-interactions-week:${selectedWeek}`;

  // Find original seed values
  const originalMetric = useMemo(() => {
    return seed.weeklyMetrics.find(
      (m) => m.memberId === selectedMemberId && m.weekIndex === selectedWeek
    ) as WeeklyMetric | undefined;
  }, [selectedMemberId, selectedWeek]);

  // Find original interactions for the ENTIRE week
  const originalInteractions = useMemo(() => {
    return seed.interactions.filter(
      (int) => int.weekIndex === selectedWeek
    ) as Interaction[];
  }, [selectedWeek]);

  // Load from session storage or fallback to seed
  useEffect(() => {
    if (!originalMetric) return;

    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResponseLagHours(parsed.responseLagHours ?? originalMetric.responseLagHours);
        setMeetingCount(parsed.meetingCount ?? originalMetric.meetingCount);
        setMoodScore(parsed.moodScore !== undefined ? parsed.moodScore : originalMetric.moodScore);
      } catch (e) {
        setResponseLagHours(originalMetric.responseLagHours);
        setMeetingCount(originalMetric.meetingCount);
        setMoodScore(originalMetric.moodScore);
      }
    } else {
      setResponseLagHours(originalMetric.responseLagHours);
      setMeetingCount(originalMetric.meetingCount);
      setMoodScore(originalMetric.moodScore);
    }

    const storedInteractions = sessionStorage.getItem(interactionsStorageKey);
    if (storedInteractions) {
      try {
        setInteractions(JSON.parse(storedInteractions));
      } catch (e) {
        setInteractions(originalInteractions);
      }
    } else {
      setInteractions(originalInteractions);
    }
  }, [selectedMemberId, selectedWeek, originalMetric, originalInteractions, storageKey, interactionsStorageKey]);

  // Handle updates and save to session storage
  const handleUpdate = (updates: { responseLagHours?: number; meetingCount?: number; moodScore?: number | null }) => {
    const newData = {
      responseLagHours: updates.responseLagHours ?? responseLagHours,
      meetingCount: updates.meetingCount ?? meetingCount,
      moodScore: updates.moodScore !== undefined ? updates.moodScore : moodScore
    };
    
    setResponseLagHours(newData.responseLagHours);
    setMeetingCount(newData.meetingCount);
    setMoodScore(newData.moodScore);

    sessionStorage.setItem(storageKey, JSON.stringify(newData));
  };

  const handleReset = () => {
    sessionStorage.removeItem(storageKey);
    sessionStorage.removeItem(interactionsStorageKey);
    if (originalMetric) {
      setResponseLagHours(originalMetric.responseLagHours);
      setMeetingCount(originalMetric.meetingCount);
      setMoodScore(originalMetric.moodScore);
    }
    setInteractions(originalInteractions);
  };

  const handleResetAll = () => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith("synthetic-data-edits:") || key.startsWith("synthetic-data-interactions-week:"))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
    
    if (originalMetric) {
      setResponseLagHours(originalMetric.responseLagHours);
      setMeetingCount(originalMetric.meetingCount);
      setMoodScore(originalMetric.moodScore);
    }
    setInteractions(originalInteractions);
  };

  const handleUpdateInteraction = (index: number, updates: Partial<Interaction>) => {
    const newInts = [...interactions];
    newInts[index] = { ...newInts[index], ...updates };
    setInteractions(newInts);
    sessionStorage.setItem(interactionsStorageKey, JSON.stringify(newInts));
  };

  const handleDeleteInteraction = (index: number) => {
    const newInts = [...interactions];
    newInts.splice(index, 1);
    setInteractions(newInts);
    sessionStorage.setItem(interactionsStorageKey, JSON.stringify(newInts));
  };

  const handleAddInteraction = () => {
    const newInts = [{
      weekIndex: selectedWeek,
      memberA: "",
      memberB: "",
      interactionStrength: 0.5,
      channel: "mixed" as const
    }, ...interactions];
    setInteractions(newInts);
    sessionStorage.setItem(interactionsStorageKey, JSON.stringify(newInts));
  };

  // Compute insight preview
  const previewInsight = useMemo(() => {
    if (!originalMetric) return { text: "No data available.", highlight: "" };
    
    // Create a modified metrics array
    const modifiedMetrics = seed.weeklyMetrics.map((m) => {
      if (m.memberId === selectedMemberId && m.weekIndex === selectedWeek) {
        return { ...m, responseLagHours, meetingCount, moodScore };
      }
      return m;
    });

    const modifiedInteractions = seed.interactions.filter(
      (int) => int.weekIndex !== selectedWeek
    ).concat(interactions);

    return generateMemberInsight(
      selectedMemberId,
      selectedWeek,
      modifiedMetrics as WeeklyMetric[],
      modifiedInteractions,
      seed.members,
      insightTone
    );
  }, [selectedMemberId, selectedWeek, responseLagHours, meetingCount, moodScore, insightTone, originalMetric, interactions]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-primary-container text-on-primary-container p-6 rounded-3xl border border-primary/20">
        <div className="flex items-start gap-4">
          <svg className="w-6 h-6 mt-1 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <h1 className="text-xl font-bold mb-2">Synthetic Data Playground</h1>
            <p className="text-sm opacity-90 leading-relaxed max-w-3xl">
              This environment allows you to transparently view and edit the demo dataset used to power the application.
              Adjust the sliders below to see how the AI insights engine responds in real-time. 
              <strong> All edits are local to your browser session (session storage) and will not affect the main Dashboard or Insights pages.</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl flex flex-col gap-6 border-outline-variant/30 border">
            <div>
              <h2 className="text-lg font-bold text-on-surface mb-4">Select Target</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Member</label>
                  <select 
                    className="w-full bg-surface text-on-surface border border-outline-variant/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                  >
                    {seed.members.map((m) => (
                      <option key={m.memberId} value={m.memberId}>
                        {m.displayName} ({m.pod} • {m.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Week</label>
                  <select 
                    className="w-full bg-surface text-on-surface border border-outline-variant/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  >
                    {seed.team.weekLabels.map((label, idx) => (
                      <option key={idx} value={idx}>
                        {label} (Week {idx})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-outline-variant/30" />

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-on-surface">Edit Metrics</h2>
                <div className="flex gap-4">
                  <button 
                    onClick={handleReset}
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Reset current
                  </button>
                  <button 
                    onClick={handleResetAll}
                    className="text-sm font-medium text-error hover:text-error/80 transition-colors"
                  >
                    Reset all
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Response Lag Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-on-surface-variant">Response Lag (Hours)</label>
                    <span className="text-sm font-bold text-primary">{responseLagHours.toFixed(1)}h</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="10" step="0.1" 
                    value={responseLagHours}
                    onChange={(e) => handleUpdate({ responseLagHours: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Meeting Count Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-on-surface-variant">Meeting Count</label>
                    <span className="text-sm font-bold text-primary">{meetingCount}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="15" step="1" 
                    value={meetingCount}
                    onChange={(e) => handleUpdate({ meetingCount: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Mood Score Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-on-surface-variant">Mood Score (1-5)</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={moodScore === null}
                          onChange={(e) => handleUpdate({ moodScore: e.target.checked ? null : 3 })}
                          className="accent-primary rounded"
                        />
                        No check-in
                      </label>
                      <span className="text-sm font-bold text-primary w-6 text-right">
                        {moodScore !== null ? moodScore.toFixed(1) : "-"}
                      </span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="5" step="0.1" 
                    value={moodScore ?? 3}
                    disabled={moodScore === null}
                    onChange={(e) => handleUpdate({ moodScore: Number(e.target.value) })}
                    className={`w-full accent-primary ${moodScore === null ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border-outline-variant/30 border">
            <h2 className="text-lg font-bold text-on-surface mb-2">Live AI Insight Preview</h2>
            <p className="text-sm text-on-surface-variant mb-6">
              This preview uses the currently active Tone <strong>({insightTone})</strong> from Settings.
            </p>

            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 rounded-l-2xl"></div>
              
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <h3 className="font-semibold text-on-surface">Insight Engine Output</h3>
              </div>
              
              <div className="space-y-3">
                <p className="text-on-surface-variant leading-relaxed text-sm">
                  {previewInsight.text.split(previewInsight.highlight).map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="bg-primary/20 text-on-surface font-semibold px-1 py-0.5 rounded text-sm mix-blend-luminosity">
                          {previewInsight.highlight}
                        </span>
                      )}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Interactions Panel (Full Width Bottom) */}
      <div className="glass-card p-6 rounded-3xl border-outline-variant/30 border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-on-surface">Edit Interactions (Week {selectedWeek})</h2>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleAddInteraction();
            }}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/10 px-4 py-2 rounded-lg"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Interaction
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {interactions.length === 0 ? (
            <p className="text-sm text-on-surface-variant italic py-4 col-span-full text-center">No interactions for this week.</p>
          ) : (
            interactions.map((int, idx) => (
              <div key={idx} className="bg-surface p-4 rounded-xl border border-outline-variant/30 space-y-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Member A</label>
                    <select 
                      className="w-full bg-surface text-sm text-on-surface border border-outline-variant/50 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={int.memberA}
                      onChange={(e) => handleUpdateInteraction(idx, { memberA: e.target.value })}
                    >
                      <option value="" disabled>Select Member A</option>
                      {seed.members.map((m) => {
                        if (m.memberId === int.memberB) return null;
                        return (
                          <option key={m.memberId} value={m.memberId}>
                            {m.displayName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Member B</label>
                    <select 
                      className="w-full bg-surface text-sm text-on-surface border border-outline-variant/50 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={int.memberB}
                      onChange={(e) => handleUpdateInteraction(idx, { memberB: e.target.value })}
                    >
                      <option value="" disabled>Select Member B</option>
                      {seed.members.map((m) => {
                        if (m.memberId === int.memberA) return null;
                        return (
                          <option key={m.memberId} value={m.memberId}>
                            {m.displayName}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Channel</label>
                    <select 
                      className="w-full bg-surface text-sm text-on-surface border border-outline-variant/50 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={int.channel}
                      onChange={(e) => handleUpdateInteraction(idx, { channel: e.target.value as "mixed" | "meetings" | "messages" | "tasks" })}
                    >
                      <option value="mixed">Mixed</option>
                      <option value="meetings">Meetings</option>
                      <option value="messages">Messages</option>
                      <option value="tasks">Tasks</option>
                    </select>
                  </div>

                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteInteraction(idx);
                    }}
                    className="mb-1 text-on-surface-variant hover:text-error transition-colors p-1"
                    aria-label="Delete Interaction"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-on-surface-variant">Strength</label>
                    <span className="text-xs font-bold text-primary">{int.interactionStrength.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.01" 
                    value={int.interactionStrength}
                    onChange={(e) => handleUpdateInteraction(idx, { interactionStrength: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
