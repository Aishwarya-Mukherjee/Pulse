export default function OverviewDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface overflow-x-hidden">
      {/* ── Top Nav Bar ── */}
      <nav
        className="
          fixed top-0 left-0 w-full z-50
          flex justify-between items-center
          px-[var(--spacing-gutter)] h-16
          bg-surface-container/50 backdrop-blur-md
          border-b border-outline-variant/50
        "
      >
        {/* Left: Brand + Nav Links */}
        <div className="flex items-center gap-[var(--spacing-md)]">
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="text-xl font-semibold text-primary tracking-tight">
              Team Pulse AI
            </span>
          </div>

          <div className="hidden md:flex gap-[var(--spacing-sm)] ml-[var(--spacing-lg)]">
            <a
              href="#"
              className="text-primary font-semibold border-b-2 border-primary pb-1 text-sm"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 text-sm"
            >
              Insights
            </a>
            <a
              href="#"
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 text-sm"
            >
              Settings
            </a>
          </div>
        </div>

        {/* Right: Icon Buttons */}
        <div className="flex items-center gap-[var(--spacing-xs)]">
          <button
            id="nav-notifications"
            aria-label="Notifications"
            className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-variant"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button
            id="nav-account"
            aria-label="Account"
            className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-variant"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main
        className="
          max-w-[1280px] mx-auto w-full
          px-[var(--spacing-gutter)]
          pt-[var(--spacing-xl)]
          pb-[var(--spacing-stack-lg)]
          flex flex-col gap-[var(--spacing-lg)]
          mt-16
        "
      >
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Team-level health &amp; collaboration at a glance
          </p>
        </div>

        {/* ── Top Bento Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-[var(--spacing-md)]">

          {/* Hero Health Score (4 cols) */}
          <div
            id="card-team-health"
            className="md:col-span-4 glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col justify-between"
          >
            <div>
              <h2 className="text-2xl font-medium text-on-surface mb-1">
                Team Health
              </h2>
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
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    className="stroke-surface-container-high"
                    strokeWidth="8"
                  />
                  {/* Progress — 78 % of circumference 289px */}
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    className="stroke-primary"
                    strokeWidth="8"
                    strokeDasharray="289"
                    strokeDashoffset="63.5"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Pulse ring overlay */}
                <div className="absolute inset-0 rounded-full border border-primary/20 pulse-ring" />

                {/* Score number */}
                <div className="text-center z-10 flex flex-col items-center">
                  <span
                    className="font-bold tracking-tight text-on-surface"
                    style={{ fontSize: "48px", lineHeight: 1.1, letterSpacing: "-0.02em" }}
                  >
                    78
                    <span className="text-on-surface-variant text-2xl font-normal">
                      /100
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Status Chip */}
            <div className="bg-primary-container/10 border border-primary/20 rounded-lg p-[var(--spacing-xs)] flex items-start gap-3">
              <svg
                className="w-5 h-5 text-primary mt-0.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-primary">Stable</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Slight dip in cross-team communication.
                </p>
              </div>
            </div>
          </div>

          {/* Collaboration Topology — Graph Placeholder (5 cols) */}
          <div
            id="card-collaboration-topology"
            className="md:col-span-5 glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-medium text-on-surface">
                Collaboration Topology
              </h2>
              {/* Legend */}
              <div className="flex gap-3 text-xs text-on-surface-variant">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                  Strong
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
                  Mild
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary inline-block" />
                  Weak
                </div>
              </div>
            </div>

            {/* ── Graph Placeholder ── */}
            <div
              id="graph-placeholder"
              className="
                flex-grow relative graph-placeholder rounded-lg
                min-h-[300px] flex flex-col items-center justify-center gap-3
              "
              aria-label="Network graph placeholder – real graph logic will be wired separately"
            >
              {/* Icon */}
              <svg
                className="w-12 h-12 text-outline opacity-40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="2" />
                <circle cx="4"  cy="6"  r="2" />
                <circle cx="20" cy="6"  r="2" />
                <circle cx="4"  cy="18" r="2" />
                <circle cx="20" cy="18" r="2" />
                <line x1="6"  y1="7"  x2="10" y2="11" />
                <line x1="18" y1="7"  x2="14" y2="11" />
                <line x1="6"  y1="17" x2="10" y2="13" />
                <line x1="18" y1="17" x2="14" y2="13" />
              </svg>
              <p className="text-sm text-outline/70 font-medium">
                Graph renderer coming soon
              </p>
              <p className="text-xs text-outline/50 text-center max-w-[200px]">
                Real collaboration graph logic will be wired here separately.
              </p>
            </div>
          </div>

          {/* AI Insights (3 cols) */}
          <div
            id="card-ai-insights"
            className="md:col-span-3 glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col"
          >
            <div className="flex items-center gap-2 mb-[var(--spacing-md)]">
              <svg
                className="w-5 h-5 text-secondary shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 18h6M10 22h4M12 2v2M12 6a6 6 0 0 1 6 6c0 2.5-1.5 4.7-3.5 5.7L14 22h-4l-.5-2.3C7.5 18.7 6 16.5 6 14A6 6 0 0 1 12 6Z" />
              </svg>
              <h2 className="text-2xl font-medium text-on-surface">AI Insights</h2>
            </div>

            <div className="flex flex-col gap-[var(--spacing-xs)] flex-grow">
              {/* Insight 1 */}
              <div className="bg-surface-container-low/50 rounded-lg p-[var(--spacing-xs)] border border-outline-variant/30 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-primary shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <p className="text-sm text-on-surface-variant">
                  Consider a sync between QA and Dev1 — collaboration signals
                  have dropped over the past 2 weeks.
                </p>
              </div>

              {/* Insight 2 */}
              <div className="bg-surface-container-low/50 rounded-lg p-[var(--spacing-xs)] border border-outline-variant/30 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-primary shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <p className="text-sm text-on-surface-variant">
                  Design pod is highly connected this sprint. Good momentum for
                  the upcoming release.
                </p>
              </div>

              {/* Insight 3 */}
              <div className="bg-surface-container-low/50 rounded-lg p-[var(--spacing-xs)] border border-outline-variant/30 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-primary shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <p className="text-sm text-on-surface-variant">
                  Backend team response time improved 18% vs last sprint.
                  Momentum is strong.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Privacy Banner ── */}
        <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-[var(--spacing-md)] py-[var(--spacing-xs)] flex items-center justify-center gap-2 text-outline">
          <svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p className="text-xs font-medium">
            Team-level insights only. No individual monitoring or surveillance.
          </p>
        </div>

        {/* ── Bottom Row — 3 Metric Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-md)]">

          {/* Response Time */}
          <div
            id="card-response-time"
            className="glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-medium text-on-surface-variant tracking-wide uppercase">
                  Response Time Trend
                </h3>
                <p className="text-2xl font-medium text-on-surface mt-1">
                  1.2 hrs
                </p>
              </div>
              <span className="text-secondary bg-secondary-container/20 p-2 rounded-lg">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
            </div>
            {/* Sparkline */}
            <div className="h-12 w-full mt-auto relative">
              <svg
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 30"
                aria-hidden="true"
              >
                <path
                  d="M0,20 Q10,25 20,15 T40,20 T60,10 T80,15 T100,5"
                  fill="none"
                  stroke="#695c51"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* Meeting Frequency */}
          <div
            id="card-meeting-frequency"
            className="glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-medium text-on-surface-variant tracking-wide uppercase">
                  Meeting Frequency
                </h3>
                <p className="text-2xl font-medium text-on-surface mt-1">
                  Optimal
                </p>
              </div>
              <span className="text-tertiary bg-tertiary-container/20 p-2 rounded-lg">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
            </div>
            {/* Mini Bar Chart */}
            <div className="h-12 w-full mt-auto flex items-end gap-1">
              {[
                { h: "h-1/3",  opacity: "opacity-30" },
                { h: "h-2/3",  opacity: "opacity-50" },
                { h: "h-full", opacity: "opacity-100" },
                { h: "h-4/5",  opacity: "opacity-80" },
                { h: "h-1/2",  opacity: "opacity-40" },
                { h: "h-3/4",  opacity: "opacity-60" },
              ].map((bar, i) => (
                <div
                  key={i}
                  className={`flex-1 bg-tertiary ${bar.h} ${bar.opacity} rounded-t`}
                />
              ))}
            </div>
          </div>

          {/* Team Sentiment */}
          <div
            id="card-team-sentiment"
            className="glass-card glow-hover rounded-2xl p-[var(--spacing-md)] flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-medium text-on-surface-variant tracking-wide uppercase">
                  Team Sentiment
                </h3>
                <p className="text-2xl font-medium text-on-surface mt-1">
                  Positive
                </p>
              </div>
              <span className="text-primary bg-primary-container/20 p-2 rounded-lg">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </span>
            </div>
            {/* Sparkline */}
            <div className="h-12 w-full mt-auto relative">
              <svg
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 30"
                aria-hidden="true"
              >
                <path
                  d="M0,15 Q20,10 40,20 T80,5 T100,10"
                  fill="none"
                  stroke="#246565"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full mt-auto py-[var(--spacing-base)] px-[var(--spacing-gutter)] flex flex-row justify-between items-center bg-surface-container-lowest border-t border-outline-variant/30 text-outline text-xs">
        <span>© 2024 Team Pulse AI. Team-level insights only.</span>
        <div className="flex gap-[var(--spacing-sm)]">
          <a href="#" className="hover:text-on-surface transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-on-surface transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-on-surface transition-colors">
            Security Whitepaper
          </a>
        </div>
      </footer>
    </div>
  );
}
