import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, X, PenSquare, MessageSquare, Radio, Loader2 } from 'lucide-react';
import BreakingNewsTicker from './BreakingNewsTicker';
import { useIsCallerAdmin, useGetLiveStatus, useToggleLiveStatus } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Political News', path: '/political' },
  { label: 'Movie News', path: '/movies' },
];

function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  // Use isFetched to avoid showing admin controls before the check completes
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched } = useIsCallerAdmin();
  const { data: liveStatus } = useGetLiveStatus();
  const toggleLiveMutation = useToggleLiveStatus();

  const isLive = liveStatus?.isLive ?? false;
  const isLiveLoading = toggleLiveMutation.isPending;

  const handleLiveToggle = async () => {
    try {
      await toggleLiveMutation.mutateAsync();
    } catch (err) {
      // Error is handled by mutation state; logged in the hook
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  // Show admin controls only when:
  // 1. User is authenticated
  // 2. Admin check has completed (not still loading)
  // 3. isAdmin is explicitly true
  const showAdminControls = isAuthenticated && !adminLoading && adminFetched && isAdmin === true;

  return (
    <header className="w-full sticky top-0 z-50 shadow-news">
      {/* Row 1: Breaking News Ticker */}
      <BreakingNewsTicker />

      {/* Row 2: Logo + Date */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/assets/generated/ap-insight-news-logo.dim_400x100.png"
              alt="AP Insight News"
              className="h-12 w-auto object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div
              className="items-center gap-2 hidden"
              style={{ display: 'none' }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 font-bold text-white text-lg"
                style={{ backgroundColor: 'oklch(0.45 0.22 25)' }}
              >
                AP
              </div>
              <div>
                <div className="font-condensed text-xl font-bold leading-tight" style={{ color: 'oklch(0.13 0.01 260)' }}>
                  AP Insight News
                </div>
                <div className="text-xs font-sans uppercase tracking-widest" style={{ color: 'oklch(0.5 0.02 260)' }}>
                  Political & Movie News
                </div>
              </div>
            </div>
          </Link>

          {/* Date + Admin links + Mobile toggle */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs font-sans" style={{ color: 'oklch(0.5 0.02 260)' }}>
              {formatDate()}
            </span>

            {/* Go Live / End Live button — admin only, desktop */}
            {showAdminControls && (
              <button
                onClick={handleLiveToggle}
                disabled={isLiveLoading}
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-sm border transition-colors disabled:opacity-60"
                style={
                  isLive
                    ? {
                        color: 'oklch(1 0 0)',
                        borderColor: 'oklch(0.45 0.22 25)',
                        backgroundColor: 'oklch(0.45 0.22 25)',
                      }
                    : {
                        color: 'oklch(0.45 0.22 25)',
                        borderColor: 'oklch(0.45 0.22 25)',
                        backgroundColor: 'transparent',
                      }
                }
              >
                {isLiveLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Radio className="w-3.5 h-3.5" />
                )}
                {isLive ? 'End Live' : 'Go Live'}
              </button>
            )}

            {/* Admin Reviews link — desktop */}
            {showAdminControls && (
              <Link
                to="/admin/reviews"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-sm border transition-colors"
                style={{
                  color: isActive('/admin/reviews') ? 'oklch(1 0 0)' : 'oklch(0.45 0.22 25)',
                  borderColor: 'oklch(0.45 0.22 25)',
                  backgroundColor: isActive('/admin/reviews') ? 'oklch(0.45 0.22 25)' : 'transparent',
                }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Movie Reviews
              </Link>
            )}

            {/* Admin Add Article link — desktop */}
            {showAdminControls && (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-sm border transition-colors"
                style={{
                  color: isActive('/admin') && !isActive('/admin/reviews') ? 'oklch(1 0 0)' : 'oklch(0.45 0.22 25)',
                  borderColor: 'oklch(0.45 0.22 25)',
                  backgroundColor: isActive('/admin') && !isActive('/admin/reviews') ? 'oklch(0.45 0.22 25)' : 'transparent',
                }}
              >
                <PenSquare className="w-3.5 h-3.5" />
                Add Article
              </Link>
            )}

            <button
              className="md:hidden p-2 rounded-sm hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              style={{ color: 'oklch(0.13 0.01 260)' }}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Category Tab Navigation */}
      <div className="bg-white border-b-2 border-primary">
        <div className="container mx-auto px-4">
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-tab ${isActive(link.path) ? 'nav-tab-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile nav */}
          {mobileOpen && (
            <nav className="md:hidden flex flex-col py-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`nav-tab ${isActive(link.path) ? 'nav-tab-active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile admin controls */}
              {showAdminControls && (
                <div className="flex flex-col gap-1 py-2 border-t border-border mt-1">
                  <button
                    onClick={() => { handleLiveToggle(); setMobileOpen(false); }}
                    disabled={isLiveLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold disabled:opacity-60"
                    style={{ color: 'oklch(0.45 0.22 25)' }}
                  >
                    {isLiveLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Radio className="w-4 h-4" />
                    )}
                    {isLive ? 'End Live' : 'Go Live'}
                  </button>
                  <Link
                    to="/admin/reviews"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold"
                    style={{ color: 'oklch(0.45 0.22 25)' }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Movie Reviews
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold"
                    style={{ color: 'oklch(0.45 0.22 25)' }}
                  >
                    <PenSquare className="w-4 h-4" />
                    Add Article
                  </Link>
                </div>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
