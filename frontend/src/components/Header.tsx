import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, X, PenSquare } from 'lucide-react';
import BreakingNewsTicker from './BreakingNewsTicker';

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

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

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

          {/* Date + Admin link + Mobile toggle */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs font-sans" style={{ color: 'oklch(0.5 0.02 260)' }}>
              {formatDate()}
            </span>
            {/* Admin link — desktop */}
            <Link
              to="/admin"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-sm border transition-colors"
              style={{
                color: isActive('/admin') ? 'oklch(1 0 0)' : 'oklch(0.45 0.22 25)',
                borderColor: 'oklch(0.45 0.22 25)',
                backgroundColor: isActive('/admin') ? 'oklch(0.45 0.22 25)' : 'transparent',
              }}
            >
              <PenSquare className="w-3.5 h-3.5" />
              Add Article
            </Link>
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
              {/* Admin link — mobile */}
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className={`nav-tab flex items-center gap-1.5 ${isActive('/admin') ? 'nav-tab-active' : ''}`}
              >
                <PenSquare className="w-3.5 h-3.5" />
                Add Article
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
