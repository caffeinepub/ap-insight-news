import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Calendar, User, Tag, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useGetNewsById, useGetNewsByCategory } from '../hooks/useQueries';
import { NewsCategory } from '../backend';
import ArticleCard from '../components/ArticleCard';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function ArticleDetailPage() {
  const { id } = useParams({ from: '/article/$id' });
  const { identity, login, isLoggingIn, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: article, isLoading, isError } = useGetNewsById(isAuthenticated ? id : '');

  const category = article?.category ?? NewsCategory.political;
  const { data: relatedArticles } = useGetNewsByCategory(category);

  const backPath = article?.category === NewsCategory.political ? '/political' : '/movies';
  const backLabel = article?.category === NewsCategory.political ? 'Political News' : 'Movie News';

  const placeholderImage =
    article?.category === NewsCategory.political
      ? '/assets/generated/placeholder-political.dim_800x450.png'
      : '/assets/generated/placeholder-movie.dim_800x450.png';

  const related = relatedArticles?.filter((a) => a.id !== id).slice(0, 4) ?? [];

  // Show spinner while identity is initializing
  if (isInitializing) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <Skeleton className="h-5 w-28 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-56 w-full" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="w-20 h-14 shrink-0" />
                  <Skeleton className="flex-1 h-14" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Not authenticated — show login prompt
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white border border-border shadow-sm p-10 flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-condensed text-2xl font-bold text-foreground mb-2 uppercase tracking-wide">
                Members Only
              </h2>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                Please log in to read the full article. AP Insight News is available exclusively to registered members.
              </p>
            </div>
            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full bg-primary text-white font-condensed font-semibold uppercase tracking-wide hover:bg-primary/90 transition-colors"
              size="lg"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Logging in…
                </span>
              ) : (
                'Login to Read Article'
              )}
            </Button>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary font-sans transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <Skeleton className="h-5 w-28 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-56 w-full" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="w-20 h-14 shrink-0" />
                  <Skeleton className="flex-1 h-14" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isError || !article) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
          <div className="bg-secondary p-10">
            <h1 className="font-condensed text-2xl font-bold text-foreground mb-3">
              Article Not Found
            </h1>
            <p className="text-muted-foreground font-sans text-sm mb-6">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 text-sm font-semibold font-condensed uppercase hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const imageSrc = article.imageUrl || placeholderImage;
  const categoryLabel = article.category === NewsCategory.political ? 'Political' : 'Movie';
  const categoryClass =
    article.category === NewsCategory.political ? 'category-badge-political' : 'category-badge-movie';

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-2 flex items-center gap-2 text-xs font-sans text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to={backPath} className="hover:text-primary transition-colors">{backLabel}</Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1 max-w-xs">{article.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main article content */}
          <article className="lg:col-span-2">
            {/* Category + back */}
            <div className="flex items-center justify-between mb-3">
              <span className={categoryClass}>{categoryLabel}</span>
              <Link
                to={backPath}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary font-sans transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                {backLabel}
              </Link>
            </div>

            {/* Title */}
            <h1 className="news-headline text-2xl md:text-3xl text-foreground mb-3 leading-tight">
              {article.title}
            </h1>

            {/* Summary */}
            <p className="text-sm text-muted-foreground font-sans mb-4 leading-relaxed border-l-4 border-primary pl-3 italic">
              {article.summary}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-sans mb-4 pb-3 border-b border-border">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span className="font-semibold text-foreground">{article.author}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(article.publicationDate)}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {categoryLabel} News
              </span>
            </div>

            {/* Featured image */}
            <div className="mb-5 overflow-hidden">
              <img
                src={imageSrc}
                alt={article.title}
                className="w-full object-cover"
                style={{ maxHeight: '400px' }}
                onError={(e) => {
                  e.currentTarget.src = placeholderImage;
                }}
              />
            </div>

            {/* Full content */}
            <div className="news-body text-foreground leading-relaxed whitespace-pre-wrap">
              {article.fullContent}
            </div>

            {/* Back link */}
            <div className="mt-8 pt-4 border-t border-border">
              <Link
                to={backPath}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 text-sm font-semibold font-condensed uppercase hover:bg-primary/90 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to {backLabel}
              </Link>
            </div>
          </article>

          {/* Sidebar: Related articles */}
          <aside className="lg:col-span-1 space-y-4">
            {related.length > 0 && (
              <div className="bg-card border border-border">
                <div className="px-3 py-2 border-b-2 border-primary">
                  <h3 className="section-title">Related {categoryLabel} News</h3>
                </div>
                <div className="p-2 space-y-0">
                  {related.map((rel) => (
                    <ArticleCard key={rel.id} article={rel} variant="compact" />
                  ))}
                </div>
              </div>
            )}

            {/* Share / info box */}
            <div className="bg-secondary border border-border p-3">
              <h4 className="section-title mb-2">About This Article</h4>
              <div className="space-y-1.5 text-xs font-sans text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>By <strong className="text-foreground">{article.author}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{formatDate(article.publicationDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  <span>{categoryLabel} News</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
