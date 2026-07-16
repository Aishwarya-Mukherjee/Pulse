import SettingsClient from "@/app/components/SettingsClient";

export default function SettingsPage() {
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
        <SettingsClient />
      </main>
    </div>
  );
}
