import { Link } from '@tanstack/react-router';
import { Calendar, User } from 'lucide-react';
import { type News, NewsCategory } from '../backend';

interface ArticleCardProps {
  article: News;
  variant?: 'default' | 'compact' | 'featured' | 'newspaper';
}

function getCategoryLabel(category: NewsCategory): string {
  return category === NewsCategory.political ? 'Political' : 'Movie';
}

function getCategoryClass(category: NewsCategory): string {
  return category === NewsCategory.political ? 'category-badge-political' : 'category-badge-movie';
}

function getPlaceholderImage(category: NewsCategory): string {
  return category === NewsCategory.political
    ? '/assets/generated/placeholder-political.dim_800x450.png'
    : '/assets/generated/placeholder-movie.dim_800x450.png';
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

// Featured hero card
function FeaturedCard({ article }: { article: News }) {
  const imageSrc = article.imageData || getPlaceholderImage(article.category);
  return (
    <Link to="/article/$id" params={{ id: article.id }} className="block group">
      <div className="relative overflow-hidden bg-card border border-border">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={imageSrc}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = getPlaceholderImage(article.category);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className={getCategoryClass(article.category)}>
              {getCategoryLabel(article.category)}
            </span>
            <h2 className="news-headline text-white text-xl md:text-2xl mt-2 mb-1 line-clamp-2">
              {article.title}
            </h2>
            <p className="text-white/80 text-sm line-clamp-2 font-sans">{article.summary}</p>
            <div className="flex items-center gap-3 mt-2 text-white/60 text-xs font-sans">
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
      </div>
    </Link>
  );
}

// Newspaper grid card (compact, dense)
function NewspaperCard({ article }: { article: News }) {
  const imageSrc = article.imageData || getPlaceholderImage(article.category);
  return (
    <Link to="/article/$id" params={{ id: article.id }} className="block group">
      <div className="article-card overflow-hidden h-full flex flex-col">
        <div className="relative overflow-hidden" style={{ height: '140px' }}>
          <img
            src={imageSrc}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = getPlaceholderImage(article.category);
            }}
          />
          <div className="absolute top-2 left-2">
            <span className={getCategoryClass(article.category)}>
              {getCategoryLabel(article.category)}
            </span>
          </div>
        </div>
        <div className="p-2 flex flex-col flex-1">
          <h3 className="news-headline text-sm leading-snug line-clamp-3 text-foreground group-hover:text-primary transition-colors mb-1">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 font-sans mb-2 flex-1">
            {article.summary}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{formatDate(article.publicationDate)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Default card
function DefaultCard({ article }: { article: News }) {
  const imageSrc = article.imageData || getPlaceholderImage(article.category);
  return (
    <Link to="/article/$id" params={{ id: article.id }} className="block group">
      <div className="article-card overflow-hidden h-full flex flex-col">
        <div className="relative overflow-hidden" style={{ height: '160px' }}>
          <img
            src={imageSrc}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = getPlaceholderImage(article.category);
            }}
          />
          <div className="absolute top-2 left-2">
            <span className={getCategoryClass(article.category)}>
              {getCategoryLabel(article.category)}
            </span>
          </div>
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="news-headline text-sm leading-snug line-clamp-3 text-foreground group-hover:text-primary transition-colors mb-1">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 font-sans mb-2 flex-1">
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

// Compact card (used in sidebars)
function CompactCard({ article }: { article: News }) {
  const imageSrc = article.imageData || getPlaceholderImage(article.category);
  return (
    <Link to="/article/$id" params={{ id: article.id }} className="block group">
      <div className="flex gap-2 py-2 border-b border-border last:border-0">
        <div className="shrink-0 overflow-hidden" style={{ width: '80px', height: '56px' }}>
          <img
            src={imageSrc}
            alt={article.title}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
            onError={(e) => {
              e.currentTarget.src = getPlaceholderImage(article.category);
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="news-headline text-xs leading-snug line-clamp-3 text-foreground group-hover:text-primary transition-colors">
            {article.title}
          </h4>
          <span className="text-xs text-muted-foreground font-sans mt-0.5 block">
            {formatDate(article.publicationDate)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  if (variant === 'featured') return <FeaturedCard article={article} />;
  if (variant === 'newspaper') return <NewspaperCard article={article} />;
  if (variant === 'compact') return <CompactCard article={article} />;
  return <DefaultCard article={article} />;
}
