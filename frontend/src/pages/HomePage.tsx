import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ArticleCard from '../components/ArticleCard';
import { useGetAllNews, useGetNewsByCategory } from '../hooks/useQueries';
import { NewsCategory } from '../backend';

function SectionDivider({ title, viewAllPath }: { title: string; viewAllPath: string }) {
  return (
    <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-primary">
      <h2 className="section-title">{title}</h2>
      <Link
        to={viewAllPath}
        className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 font-sans transition-colors group"
      >
        View All <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}

function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-border overflow-hidden">
          <Skeleton className="h-36 w-full" />
          <div className="p-2 space-y-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { data: allNews, isLoading: allLoading } = useGetAllNews();
  const { data: politicalNews, isLoading: politicalLoading } = useGetNewsByCategory(NewsCategory.political);
  const { data: movieNews, isLoading: movieLoading } = useGetNewsByCategory(NewsCategory.movie);

  // Sort by date descending
  const sortedAll = allNews ?? [];
  const heroArticle = sortedAll[0] ?? null;
  const secondaryArticles = sortedAll.slice(1, 4);

  const recentPolitical = politicalNews ?? [];
  const recentMovies = movieNews ?? [];

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">

        {/* ── HERO SECTION ── */}
        {allLoading ? (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Skeleton className="h-72 w-full" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="h-16 w-24 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : heroArticle ? (
          <section className="mb-6">
            <div className="section-divider" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Main hero */}
              <div className="md:col-span-2">
                <ArticleCard article={heroArticle} variant="featured" />
              </div>
              {/* Secondary stories */}
              <div className="flex flex-col gap-0">
                {secondaryArticles.length > 0 ? (
                  secondaryArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} variant="compact" />
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground font-sans p-2">
                    More stories coming soon.
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="mb-6 bg-secondary p-8 text-center">
            <p className="font-condensed text-lg text-muted-foreground">
              No articles available yet. Check back soon!
            </p>
          </section>
        )}

        {/* ── MAIN CONTENT + SIDEBAR ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Main content: 3 columns */}
          <div className="lg:col-span-3 space-y-6">

            {/* Political News Section */}
            <section>
              <SectionDivider title="Political News" viewAllPath="/political" />
              {politicalLoading ? (
                <GridSkeleton count={4} />
              ) : recentPolitical.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {recentPolitical.slice(0, 8).map((article) => (
                    <ArticleCard key={article.id} article={article} variant="newspaper" />
                  ))}
                </div>
              ) : (
                <div className="bg-secondary p-6 text-center">
                  <p className="text-muted-foreground font-sans text-sm">No political articles yet.</p>
                </div>
              )}
            </section>

            {/* Divider ad-like strip */}
            <div className="bg-primary/5 border border-primary/20 py-2 px-4 flex items-center justify-between">
              <span className="text-xs font-condensed font-bold uppercase tracking-wider text-primary">
                Latest Movie News
              </span>
              <Link to="/movies" className="text-xs text-primary hover:underline font-sans">
                See all →
              </Link>
            </div>

            {/* Movie News Section */}
            <section>
              <SectionDivider title="Movie News" viewAllPath="/movies" />
              {movieLoading ? (
                <GridSkeleton count={4} />
              ) : recentMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {recentMovies.slice(0, 8).map((article) => (
                    <ArticleCard key={article.id} article={article} variant="newspaper" />
                  ))}
                </div>
              ) : (
                <div className="bg-secondary p-6 text-center">
                  <p className="text-muted-foreground font-sans text-sm">No movie articles yet.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar: 1 column */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Top Political Stories */}
            <div className="bg-card border border-border">
              <div className="px-3 py-2 border-b-2 border-primary">
                <h3 className="section-title">Top Political</h3>
              </div>
              <div className="divide-y divide-border">
                {politicalLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-3 flex gap-2">
                      <Skeleton className="w-6 h-6 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  ))
                ) : recentPolitical.slice(0, 5).map((article, index) => (
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
                        {new Date(article.publicationDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Movie Stories */}
            <div className="bg-card border border-border">
              <div className="px-3 py-2 border-b-2 border-primary">
                <h3 className="section-title">Top Movies</h3>
              </div>
              <div className="divide-y divide-border">
                {movieLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-3 flex gap-2">
                      <Skeleton className="w-6 h-6 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  ))
                ) : recentMovies.slice(0, 5).map((article, index) => (
                  <Link
                    key={article.id}
                    to="/article/$id"
                    params={{ id: article.id }}
                    className="flex gap-2 p-3 hover:bg-secondary/50 transition-colors group"
                  >
                    <span
                      className="shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold text-white font-condensed"
                      style={{ backgroundColor: 'oklch(0.35 0.01 260)' }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="news-headline text-xs leading-snug line-clamp-3 text-foreground group-hover:text-primary transition-colors">
                        {article.title}
                      </p>
                      <span className="text-xs text-muted-foreground font-sans mt-0.5 block">
                        {new Date(article.publicationDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
