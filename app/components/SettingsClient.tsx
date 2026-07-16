"use client";

import { useConfig } from "@/app/contexts/ConfigContext";

export default function SettingsClient() {
  const { weights, setWeights, insightTone, setInsightTone } = useConfig();

  const handleWeightChange = (key: keyof typeof weights, newValue: number) => {
    const newVal = newValue / 100;
    
    const otherKeys = (Object.keys(weights) as Array<keyof typeof weights>).filter(k => k !== key);
    const key1 = otherKeys[0];
    const key2 = otherKeys[1];
    
    const currentOtherSum = weights[key1] + weights[key2];
    
    const newWeights = { ...weights, [key]: newVal };
    
    if (newVal + currentOtherSum > 1.0) {
      const remainingVal = 1 - newVal;
      if (currentOtherSum === 0) {
        newWeights[key1] = remainingVal / 2;
        newWeights[key2] = remainingVal / 2;
      } else {
        newWeights[key1] = (weights[key1] / currentOtherSum) * remainingVal;
        newWeights[key2] = (weights[key2] / currentOtherSum) * remainingVal;
      }
    }
    
    setWeights(newWeights);
  };

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
              onChange={(e) => handleWeightChange('responseLag', parseInt(e.target.value))}
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
              onChange={(e) => handleWeightChange('meetingCount', parseInt(e.target.value))}
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
              onChange={(e) => handleWeightChange('moodScore', parseInt(e.target.value))}
              aria-label="Mood Check-in Weight"
              className="w-full accent-tertiary h-2 bg-surface-container-highest rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-tertiary/50" 
            />
          </div>
        </div>
      </div>

      {/* ── Insight Tone Selector ── */}
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-on-surface mb-1 tracking-tight">Insight Tone</h2>
          <p className="text-on-surface-variant text-sm">
            Select the phrasing style for the AI-generated member insights.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-lg)]">
          {[
            {
              id: "Supportive",
              label: "Supportive",
              desc: "Empathic coaching language focused on resilience."
            },
            {
              id: "Direct",
              label: "Direct",
              desc: "Clear observations with actionable next steps."
            },
            {
              id: "Analytical",
              label: "Analytical",
              desc: "Data-heavy breakdowns of sentiment and patterns."
            }
          ].map((tone) => {
            const isSelected = insightTone === tone.id;
            return (
              <button
                key={tone.id}
                onClick={() => setInsightTone(tone.id as any)}
                className={`text-left glass-card rounded-2xl p-6 transition-all border flex flex-col gap-3 relative overflow-hidden group ${
                  isSelected
                    ? "border-primary bg-surface-container-highest shadow-md"
                    : "border-outline-variant/30 hover:bg-surface-container-highest/50 hover:border-outline-variant/60"
                }`}
              >
                {/* Active Indicator Line */}
                {isSelected && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                )}
                
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-semibold text-base text-on-surface">
                    {tone.label}
                  </h3>
                  {/* Radio Indicator */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected 
                      ? "border-primary bg-primary" 
                      : "border-outline-variant group-hover:border-outline"
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-on-primary" />
                    )}
                  </div>
                </div>
                
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {tone.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Privacy Dashboard ── */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-on-surface mb-1 tracking-tight">Privacy Dashboard</h2>
            <p className="text-on-surface-variant text-sm">
              Your trust is our primary metric. We do not surveil; we support.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded-full text-[var(--color-success)]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-xs font-bold tracking-wide uppercase">Privacy Shield Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-lg)] mb-[var(--spacing-lg)]">
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 border border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </div>
            <h3 className="font-semibold text-on-surface">Data Usage</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Aggregated metrics only (response lag, meeting count, mood). We never read, expose, or process raw chat contents, private messages, or task text.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 border border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12h4l2-9 5 18 3-9h6" />
              </svg>
            </div>
            <h3 className="font-semibold text-on-surface">Zero Identification</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              All individual metrics are compared against the team average. We do not surface absolute individual numbers for isolation or lag, but rather deviations from the team's current climate.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 border border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary mb-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="font-semibold text-on-surface">Data Retention</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              This is a demonstration environment; retention rules would be configured at deployment.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 bg-surface-container-high/50 border border-outline-variant/30 flex items-start sm:items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-on-primary">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-on-surface text-sm">Non-Surveillance Commitment</h4>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Pulse AI will never share individual-level data with management. Metrics are compared against team baseline rather than surfacing raw individual trend data, avoiding individual surveillance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
