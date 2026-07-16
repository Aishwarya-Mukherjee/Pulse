'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function TopNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(2);

  return (
    <nav className="
      fixed top-4 inset-x-4 md:inset-x-8 max-w-7xl mx-auto z-50
      flex justify-between items-center
      px-4 md:px-6 h-14 md:h-16
      bg-surface-container-lowest/40 backdrop-blur-xl
      border border-outline-variant/30 rounded-full
      shadow-[0_4px_24px_rgba(0,0,0,0.04)]
      transition-all duration-300
    ">
      {/* Left: Brand + Nav Links */}
      <div className="flex items-center gap-2 md:gap-8">
        <div className="flex items-center gap-2.5 mr-2 md:mr-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="text-lg md:text-xl font-bold text-on-surface tracking-tight hidden sm:block">
            Team Pulse AI
          </span>
        </div>
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" 
            className={`font-medium text-sm px-4 py-2 rounded-full transition-all duration-300 ${
              pathname === '/' 
                ? 'bg-primary-container text-on-primary-container shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
            }`}>
            Dashboard
          </Link>
          <Link href="/insights" 
            className={`font-medium text-sm px-4 py-2 rounded-full transition-all duration-300 ${
              pathname === '/insights' 
                ? 'bg-primary-container text-on-primary-container shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
            }`}>
            Insights
          </Link>
          <Link href="/settings" 
            className={`font-medium text-sm px-4 py-2 rounded-full transition-all duration-300 ${
              pathname === '/settings' 
                ? 'bg-primary-container text-on-primary-container shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
            }`}>
            Settings
          </Link>
        </div>
      </div>

      {/* Right: Icon Buttons & Mobile Menu Toggle */}
      <div className="flex items-center gap-[var(--spacing-xs)]">
        <ThemeToggle />
        
        <div className="relative">
          <button id="nav-notifications" aria-label="Notifications"
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="hidden md:flex w-10 h-10 items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-300 rounded-full hover:bg-surface-variant hover:scale-105 active:scale-95 relative focus:outline-none focus:ring-2 focus:ring-primary">
            
            {/* Notification Badge */}
            {alertCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error border border-background"></span>
            )}
            
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          
          {/* ── Alerts Center Panel ── */}
          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-high border border-outline-variant/30 shadow-xl rounded-xl p-0 animate-in slide-in-from-top-2 z-50 overflow-hidden">
              <div className="bg-surface-container-highest p-3 border-b border-outline-variant/20 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-on-surface">Team Anomalies</h3>
                {alertCount > 0 && (
                  <span className="text-[10px] font-bold text-on-error bg-error px-2 py-0.5 rounded-full">{alertCount} New</span>
                )}
              </div>
              <div className="flex flex-col">
                <div className="p-3 border-b border-outline-variant/10 hover:bg-surface-container transition-colors cursor-pointer flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-error mb-0.5">Response Lag Spiked</p>
                    <p className="text-[11px] text-on-surface-variant leading-tight">Backend Pod average lag increased by 45% this week.</p>
                  </div>
                </div>
                <div className="p-3 hover:bg-surface-container transition-colors cursor-pointer flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-tertiary mb-0.5">Silo Risk Detected</p>
                    <p className="text-[11px] text-on-surface-variant leading-tight">Cross-pod collaboration dropped for Design Pod.</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setAlertCount(0);
                  setIsAlertsOpen(false);
                }}
                className="w-full p-2 text-xs font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors border-t border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary">
                Acknowledge All
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <button id="nav-account" aria-label="Account Settings"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="hidden md:flex w-10 h-10 items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-300 rounded-full hover:bg-surface-variant hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
          
          {/* ── Demo Profile Panel ── */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container-high border border-outline-variant/30 shadow-xl rounded-xl p-0 animate-in slide-in-from-top-2 z-50 overflow-hidden">
              <div className="p-4 border-b border-outline-variant/20 flex items-center gap-3 bg-surface-container-highest">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/30">
                  SD
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-semibold text-on-surface truncate">Soumyadip Dey</h3>
                  <p className="text-xs text-on-surface-variant truncate">Team Lead</p>
                </div>
              </div>
              <div className="p-2">
                <Link
                  href="/synthetic-data"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-3 py-2 text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-highest rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  View Demo Data
                </Link>
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-3 py-2 text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-highest rounded-lg transition-colors flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="md:hidden w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-300 rounded-full hover:bg-surface-variant active:scale-95"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 mx-4 bg-surface-container/95 backdrop-blur-xl border border-outline-variant/30 rounded-2xl flex flex-col md:hidden p-3 shadow-xl animate-in slide-in-from-top-4">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}
            className={`px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${pathname === '/' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-variant/50'}`}>
            Dashboard
          </Link>
          <Link href="/insights" onClick={() => setIsMobileMenuOpen(false)}
            className={`px-4 py-3 mt-1 rounded-xl font-medium text-sm transition-all duration-200 ${pathname === '/insights' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-variant/50'}`}>
            Pulse AI Insights
          </Link>
          <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}
            className={`px-4 py-3 mt-1 rounded-xl font-medium text-sm transition-all duration-200 ${pathname === '/settings' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-variant/50'}`}>
            Settings
          </Link>
        </div>
      )}

    </nav>
  );
}
