export default function Footer() {
  return (
    <footer className="w-full mt-auto py-[var(--spacing-md)] px-[var(--spacing-gutter)] flex flex-row justify-between items-center bg-surface-container-lowest border-t border-outline-variant/30 text-outline text-xs">
      <span>© 2026 Team Pulse AI. Team-level insights only.</span>
      <div className="flex gap-[var(--spacing-sm)]">
        <a href="#" className="hover:text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-1 -mx-1">Privacy Policy</a>
        <a href="#" className="hover:text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-1 -mx-1">Terms of Service</a>
        <a href="#" className="hover:text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-1 -mx-1">Security Whitepaper</a>
      </div>
    </footer>
  );
}
