import seed from "@/data/team-pulse-seed.json";
import InsightsClient from "@/app/components/InsightsClient";

export default function InsightsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-x-hidden">
      <main className="
        max-w-[1280px] mx-auto w-full
        px-[var(--spacing-gutter)]
        pt-[var(--spacing-xl)]
        pb-[var(--spacing-stack-lg)]
        flex flex-col gap-[var(--spacing-lg)]
        mt-24 md:mt-28
      ">
        <InsightsClient data={seed} />
      </main>
    </div>
  );
}
