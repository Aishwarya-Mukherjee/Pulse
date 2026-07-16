import seed from "@/data/team-pulse-seed.json";
import DashboardClient from "@/app/components/DashboardClient";

/**
 * page.tsx — Server Component (no "use client")
 *
 * Responsibility: load static seed data at build/request time and hand it
 * to DashboardClient, which owns all interactivity (week state, scrubber,
 * live metric cards, graph updates).
 */
export default function OverviewDashboard() {
  return (
    <div className="flex flex-col flex-1 overflow-x-hidden">

      {/* ── Main Content ── */}
      <main className="
        max-w-[1280px] mx-auto w-full
        px-[var(--spacing-gutter)]
        pt-[var(--spacing-xl)]
        pb-[var(--spacing-stack-lg)]
        flex flex-col gap-[var(--spacing-lg)]
        mt-24 md:mt-28
      ">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Overview</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Team-level health &amp; collaboration at a glance
          </p>
        </div>

        {/* All interactive content lives in the Client Component */}
        <DashboardClient data={seed} />
      </main>

    </div>
  );
}
