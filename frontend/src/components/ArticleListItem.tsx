import { Link } from '@tanstack/react-router';
import { Calendar, User } from 'lucide-react';
import { type News, NewsCategory } from '../backend';

interface ArticleListItemProps {
  article: News;
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

export default function ArticleListItem({ article }: ArticleListItemProps) {
  const imageSrc =
    article.imageData ||
    (article.category === NewsCategory.political
      ? '/assets/generated/placeholder-political.dim_800x450.png'
      : '/assets/generated/placeholder-movie.dim_800x450.png');

  const categoryClass =
    article.category === NewsCategory.political
      ? 'category-badge-political'
      : 'category-badge-movie';

  const categoryLabel =
    article.category === NewsCategory.political ? 'Political' : 'Movie';

  return (
    <Link to="/article/$id" params={{ id: article.id }} className="block group">
      <div className="flex gap-3 py-3 border-b border-border hover:bg-secondary/40 transition-colors px-1">
        {/* Thumbnail */}
        <div className="shrink-0 overflow-hidden" style={{ width: '120px', height: '80px' }}>
          <img
            src={imageSrc}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              e.currentTarget.src =
                article.category === NewsCategory.political
                  ? '/assets/generated/placeholder-political.dim_800x450.png'
                  : '/assets/generated/placeholder-movie.dim_800x450.png';
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={categoryClass}>{categoryLabel}</span>
          </div>
          <h3 className="news-headline text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors mb-1">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 font-sans mb-1.5">
            {article.summary}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-sans">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {article.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(article.publicationDate)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
