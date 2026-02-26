import { Link } from '@tanstack/react-router';
import { type News } from '../backend';
import AdBanner from './AdBanner';

interface TopStoriesSidebarProps {
  articles: News[];
  title?: string;
}

function sortByDateDesc(articles: News[]): News[] {
  return [...articles].sort((a, b) => {
    const timeA = Number(a.createdAt);
    const timeB = Number(b.createdAt);
    return timeB - timeA;
  });
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function TopStoriesSidebar({ articles, title = 'Top Stories' }: TopStoriesSidebarProps) {
  // Sort by createdAt descending (latest first) before slicing top 5
  const topArticles = sortByDateDesc(articles).slice(0, 5);

  return (
    <div className="space-y-4">
      <aside className="bg-card border border-border">
        {/* Sidebar header */}
        <div className="px-3 py-2 border-b-2 border-primary">
          <h3 className="section-title">{title}</h3>
        </div>

        {/* Article list */}
        <div className="divide-y divide-border">
          {topArticles.length === 0 ? (
            <p className="text-xs text-muted-foreground font-sans p-3">No articles available.</p>
          ) : (
            topArticles.map((article, index) => (
              <Link
                key={article.id}
                to="/article/$id"
                params={{ id: article.id }}
                className="flex gap-2 p-3 hover:bg-secondary/50 transition-colors group"
              >
                <span
                  className="shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold text-white font-condensed"
                  style={{ backgroundColor: 'oklch(0.45 0.22 25)' }}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="news-headline text-xs leading-snug line-clamp-3 text-foreground group-hover:text-primary transition-colors">
                    {article.title}
                  </p>
                  <span className="text-xs text-muted-foreground font-sans mt-0.5 block">
                    {formatDate(article.publicationDate)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </aside>

      {/* Rectangle ad below top stories */}
      <AdBanner adSlot="2345678901" adFormat="rectangle" />
    </div>
  );
}
