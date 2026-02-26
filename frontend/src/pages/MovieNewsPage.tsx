import { useState } from 'react';
import { Film, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ArticleListItem from '../components/ArticleListItem';
import TopStoriesSidebar from '../components/TopStoriesSidebar';
import { useGetNewsByCategory } from '../hooks/useQueries';
import { NewsCategory, type News } from '../backend';

const PAGE_SIZE = 10;

function sortByDateDesc(articles: News[]): News[] {
  return [...articles].sort((a, b) => {
    const timeA = Number(a.createdAt);
    const timeB = Number(b.createdAt);
    return timeB - timeA;
  });
}

function ListSkeleton() {
  return (
    <div className="flex gap-3 py-3 border-b border-border">
      <Skeleton className="shrink-0 w-28 h-20" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export default function MovieNewsPage() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { data: articles, isLoading, isError } = useGetNewsByCategory(NewsCategory.movie);

  // Sort articles by createdAt descending (latest first)
  const sortedArticles = sortByDateDesc(articles ?? []);
  const visibleArticles = sortedArticles.slice(0, visibleCount);
  const hasMore = sortedArticles.length > visibleCount;
  const topStories = sortedArticles.slice(0, 5);

  return (
    <main className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b-2 border-primary bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Film className="w-5 h-5 text-primary" />
          <h1 className="font-condensed text-2xl font-bold text-foreground uppercase tracking-wide">
            Movie News
          </h1>
          {!isLoading && (
            <span className="text-xs text-muted-foreground font-sans ml-2">
              ({sortedArticles.length} articles)
            </span>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Main article list */}
          <div className="lg:col-span-3">
            {isError ? (
              <div className="bg-destructive/10 border border-destructive/20 p-6 text-center">
                <p className="text-destructive font-sans text-sm">Failed to load articles. Please try again.</p>
              </div>
            ) : isLoading ? (
              <div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <ListSkeleton key={i} />
                ))}
              </div>
            ) : visibleArticles.length === 0 ? (
              <div className="bg-secondary p-10 text-center">
                <Film className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-condensed text-lg text-muted-foreground">
                  No movie articles available yet.
                </p>
                <p className="text-muted-foreground font-sans text-sm mt-1">
                  Check back soon for the latest movie news.
                </p>
              </div>
            ) : (
              <>
                <div>
                  {visibleArticles.map((article) => (
                    <ArticleListItem key={article.id} article={article} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 text-sm font-semibold font-condensed uppercase tracking-wide hover:bg-primary/90 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Load More
                    </button>
                    <p className="text-muted-foreground text-xs font-sans mt-2">
                      Showing {visibleCount} of {sortedArticles.length} articles
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <TopStoriesSidebar articles={topStories} title="Top Movie Stories" />
          </aside>
        </div>
      </div>
    </main>
  );
}
