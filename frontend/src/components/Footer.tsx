import { Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'ap-insight-news');

  return (
    <footer className="bg-white border-t-2 border-primary mt-auto">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/ap-insight-news-logo.dim_400x100.png"
                alt="AP Insight News"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <p className="text-muted-foreground text-xs font-sans leading-relaxed max-w-xs">
              Your trusted source for the latest political developments and entertainment news from Andhra Pradesh and beyond.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h3 className="section-title border-b border-primary pb-1">Quick Links</h3>
            <nav className="flex flex-col gap-1.5">
              <Link to="/" className="text-muted-foreground hover:text-primary text-xs font-sans transition-colors">
                Home
              </Link>
              <Link to="/political" className="text-muted-foreground hover:text-primary text-xs font-sans transition-colors">
                Political News
              </Link>
              <Link to="/movies" className="text-muted-foreground hover:text-primary text-xs font-sans transition-colors">
                Movie News
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h3 className="section-title border-b border-primary pb-1">Categories</h3>
            <div className="flex flex-col gap-1.5">
              <Link to="/political" className="inline-flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-primary transition-colors">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Political News
              </Link>
              <Link to="/movies" className="inline-flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-primary transition-colors">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'oklch(0.35 0.01 260)' }} />
                Movie News
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border bg-secondary">
        <div className="container mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs font-sans">
            © {year} AP Insight News. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs font-sans flex items-center gap-1">
            Built with{' '}
            <Heart className="w-3 h-3 text-primary fill-primary" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
