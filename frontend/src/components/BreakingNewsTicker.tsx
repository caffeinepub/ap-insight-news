import { Link } from '@tanstack/react-router';
import { useGetAllNews } from '../hooks/useQueries';

export default function BreakingNewsTicker() {
  const { data: allNews } = useGetAllNews();
  const tickerItems = allNews?.slice(0, 10) ?? [];

  const defaultText = 'AP Insight News — Your trusted source for Political & Movie News from Andhra Pradesh and beyond';

  return (
    <div className="ticker-bar flex items-stretch overflow-hidden" style={{ minHeight: '32px' }}>
      {/* Badge */}
      <div
        className="shrink-0 flex items-center px-3 font-bold text-xs uppercase tracking-widest text-white z-10"
        style={{ backgroundColor: 'oklch(0.35 0.2 25)', minWidth: '110px' }}
      >
        🔴 Breaking
      </div>

      {/* Scrolling content */}
      <div className="flex-1 overflow-hidden flex items-center relative">
        <div className="ticker-animate text-xs text-white font-medium py-1">
          {tickerItems.length > 0
            ? tickerItems.map((article, i) => (
                <span key={article.id}>
                  <Link
                    to="/article/$id"
                    params={{ id: article.id }}
                    className="hover:underline cursor-pointer"
                  >
                    {article.title}
                  </Link>
                  {i < tickerItems.length - 1 && (
                    <span className="mx-4 opacity-60">◆</span>
                  )}
                </span>
              ))
            : <span>{defaultText}</span>
          }
        </div>
      </div>
    </div>
  );
}
