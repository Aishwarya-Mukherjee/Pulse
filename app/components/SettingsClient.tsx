"use client";

import { useConfig } from "@/app/contexts/ConfigContext";

export default function SettingsClient() {
  const { weights, setWeights } = useConfig();

  return (
    <div className="flex flex-col gap-[var(--spacing-lg)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Team Health Engine</h1>
        <p className="text-on-surface-variant max-w-2xl leading-relaxed">
          Fine-tune the weights used by the Pulse AI simulation algorithm to calculate the overall team health score. The system automatically normalizes the sum to 100%.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-lg)]">
        {/* Response Lag Card */}
        <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Response Lag</h2>
              <p className="text-xs text-on-surface-variant">Sensitivity to delayed communication</p>
            </div>
          </div>
          
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
            Measures the time it takes for team members to respond to direct messages and PR reviews. Higher weights penalize slower response times more heavily, acting as an early indicator of burnout or disengagement.
          </p>

          <div className="mt-auto pt-4 border-t border-outline-variant/20">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-on-surface">Current Weight</span>
              <span className="text-primary font-bold text-base">{Math.round(weights.responseLag * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={Math.round(weights.responseLag * 100)} 
              onChange={(e) => setWeights({ ...weights, responseLag: parseInt(e.target.value) / 100 })}
              aria-label="Response Lag Weight"
              className="w-full accent-primary h-2 bg-surface-container-highest rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50" 
            />
          </div>
        </div>

        {/* Meeting Frequency Card */}
        <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Meeting Frequency</h2>
              <p className="text-xs text-on-surface-variant">Impact of meeting overload</p>
            </div>
          </div>
          
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
            Evaluates the density of calendars and back-to-back meetings. Higher weights heavily penalize schedules with insufficient focus time, reflecting cognitive drain and reduced deep-work capacity.
          </p>

          <div className="mt-auto pt-4 border-t border-outline-variant/20">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-on-surface">Current Weight</span>
              <span className="text-secondary font-bold text-base">{Math.round(weights.meetingCount * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={Math.round(weights.meetingCount * 100)} 
              onChange={(e) => setWeights({ ...weights, meetingCount: parseInt(e.target.value) / 100 })}
              aria-label="Meeting Frequency Weight"
              className="w-full accent-secondary h-2 bg-surface-container-highest rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-secondary/50" 
            />
          </div>
        </div>

        {/* Mood Check-in Card */}
        <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Mood Check-in</h2>
              <p className="text-xs text-on-surface-variant">Self-reported sentiment analysis</p>
            </div>
          </div>
          
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
            Factors in explicitly provided sentiment scores from weekly polls or quick pulse checks. Higher weights prioritize human-reported feelings over metadata, treating them as ground truth for morale.
          </p>

          <div className="mt-auto pt-4 border-t border-outline-variant/20">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-on-surface">Current Weight</span>
              <span className="text-tertiary font-bold text-base">{Math.round(weights.moodScore * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={Math.round(weights.moodScore * 100)} 
              onChange={(e) => setWeights({ ...weights, moodScore: parseInt(e.target.value) / 100 })}
              aria-label="Mood Check-in Weight"
              className="w-full accent-tertiary h-2 bg-surface-container-highest rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-tertiary/50" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
