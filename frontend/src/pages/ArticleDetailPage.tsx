import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Star,
  MessageSquare,
  Loader2,
  CheckCircle2,
  Trash2,
  Clock,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useGetNewsById,
  useGetNewsByCategory,
  useGetReviewsByArticleId,
  useAddReview,
  useDeleteNews,
} from '../hooks/useQueries';
import { NewsCategory } from '../backend';
import ArticleCard from '../components/ArticleCard';
import AdBanner from '../components/AdBanner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';

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

function formatReviewDate(nanoseconds: bigint): string {
  try {
    const ms = Number(nanoseconds / BigInt(1_000_000));
    return new Date(ms).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/** Convert nanosecond bigint timestamp to JS Date */
function nsToDate(ns: bigint): Date {
  return new Date(Number(ns / BigInt(1_000_000)));
}

/** Returns true if the article is expired */
function isArticleExpired(expiresAt: bigint): boolean {
  return nsToDate(expiresAt) < new Date();
}

function StarRating({
  rating,
  interactive = false,
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? 'cursor-pointer focus:outline-none' : 'cursor-default'}
          aria-label={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              star <= (interactive ? hovered || rating : rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-muted-foreground/40'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewsSection({ articleId }: { articleId: string }) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: reviews, isLoading: reviewsLoading } = useGetReviewsByArticleId(articleId);
  const addReviewMutation = useAddReview();

  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; rating?: string; text?: string }>(
    {}
  );
  const [successMsg, setSuccessMsg] = useState(false);

  const validateForm = () => {
    const errors: { name?: string; rating?: string; text?: string } = {};
    if (!reviewerName.trim()) errors.name = 'Name is required.';
    if (!rating) errors.rating = 'Please select a rating.';
    if (!reviewText.trim()) errors.text = 'Review text is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(false);
    if (!validateForm()) return;

    try {
      await addReviewMutation.mutateAsync({
        articleId,
        reviewerName: reviewerName.trim(),
        rating: BigInt(rating),
        reviewText: reviewText.trim(),
      });
      setReviewerName('');
      setRating(0);
      setReviewText('');
      setFormErrors({});
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch {
      // error handled by mutation state
    }
  };

  return (
    <section className="mt-8 pt-6 border-t border-border">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-5">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="font-condensed text-xl font-bold text-foreground uppercase tracking-wide">
          Reader Reviews
        </h2>
        {reviews && reviews.length > 0 && (
          <span className="ml-1 bg-primary text-white text-xs font-bold px-2 py-0.5 font-sans">
            {reviews.length}
          </span>
        )}
      </div>

      {/* Existing reviews */}
      {reviewsLoading ? (
        <div className="space-y-3 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="border border-border p-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-3 mb-6">
          {reviews.map((review) => (
            <div key={String(review.id)} className="border border-border p-4 bg-card">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-condensed font-bold text-sm text-foreground">
                    {review.reviewerName}
                  </span>
                  <StarRating rating={Number(review.rating)} />
                </div>
                <span className="text-xs text-muted-foreground font-sans">
                  {formatReviewDate(review.createdAt)}
                </span>
              </div>
              <p className="text-sm text-foreground/80 font-sans leading-relaxed">
                {review.reviewText}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground font-sans mb-6 italic">
          No reviews yet. Be the first to share your thoughts!
        </p>
      )}

      {/* Add review form */}
      {isAuthenticated ? (
        <div className="border border-border p-4 bg-secondary/30">
          <h3 className="font-condensed font-bold text-base text-foreground uppercase tracking-wide mb-4">
            Write a Review
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reviewerName" className="text-xs font-sans font-semibold uppercase tracking-wide text-muted-foreground">
                Your Name
              </Label>
              <Input
                id="reviewerName"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1 font-sans text-sm"
                disabled={addReviewMutation.isPending}
              />
              {formErrors.name && (
                <p className="text-xs text-destructive font-sans mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label className="text-xs font-sans font-semibold uppercase tracking-wide text-muted-foreground">
                Rating
              </Label>
              <div className="mt-1">
                <StarRating rating={rating} interactive onRate={setRating} />
              </div>
              {formErrors.rating && (
                <p className="text-xs text-destructive font-sans mt-1">{formErrors.rating}</p>
              )}
            </div>

            <div>
              <Label htmlFor="reviewText" className="text-xs font-sans font-semibold uppercase tracking-wide text-muted-foreground">
                Your Review
              </Label>
              <Textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this article..."
                rows={3}
                className="mt-1 font-sans text-sm resize-none"
                disabled={addReviewMutation.isPending}
              />
              {formErrors.text && (
                <p className="text-xs text-destructive font-sans mt-1">{formErrors.text}</p>
              )}
            </div>

            {addReviewMutation.isError && (
              <p className="text-xs text-destructive font-sans">
                Failed to submit review. Please try again.
              </p>
            )}

            {successMsg && (
              <div className="flex items-center gap-1.5 text-xs text-green-700 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Review submitted successfully!
              </div>
            )}

            <Button
              type="submit"
              disabled={addReviewMutation.isPending}
              className="font-condensed uppercase tracking-wide text-sm"
            >
              {addReviewMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </form>
        </div>
      ) : (
        <div className="border border-border p-4 bg-secondary/30 text-center">
          <p className="text-sm text-muted-foreground font-sans mb-3">
            Please log in to write a review.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            variant="default"
            className="font-condensed uppercase tracking-wide text-sm"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Logging in…
              </>
            ) : (
              'Login to Review'
            )}
          </Button>
        </div>
      )}
    </section>
  );
}

export default function ArticleDetailPage() {
  const { id } = useParams({ from: '/article/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();

  const { data: article, isLoading, isError } = useGetNewsById(id);
  const { data: relatedNews } = useGetNewsByCategory(
    article?.category ?? NewsCategory.political
  );
  const deleteNewsMutation = useDeleteNews();

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!actor || !identity) {
      setIsAdmin(false);
      return;
    }
    actor.isCallerAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));
  }, [actor, identity]);

  const handleDelete = async () => {
    try {
      await deleteNewsMutation.mutateAsync(id);
      navigate({ to: '/' });
    } catch {
      // error handled by mutation state
    }
  };

  const relatedArticles = (relatedNews ?? [])
    .filter((a) => a.id !== id)
    .slice(0, 4);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Skeleton className="h-4 w-24 mb-6" />
          <Skeleton className="h-8 w-3/4 mb-3" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>
      </main>
    );
  }

  if (isError || !article) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <p className="font-condensed text-2xl font-bold text-foreground mb-2">Article Not Found</p>
          <p className="text-muted-foreground font-sans text-sm mb-4">
            This article may have been removed or does not exist.
          </p>
          <Link to="/" className="text-primary hover:underline font-sans text-sm">
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  // Check if article is expired
  if (isArticleExpired(article.expiresAt)) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-condensed text-2xl font-bold text-foreground mb-2">Article Expired</p>
          <p className="text-muted-foreground font-sans text-sm mb-4">
            This article is no longer available as it has passed its expiration date.
          </p>
          <Link to="/" className="text-primary hover:underline font-sans text-sm">
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const categoryLabel = article.category === NewsCategory.movie ? 'Movie News' : 'Political News';
  const categoryPath = article.category === NewsCategory.movie ? '/movies' : '/political';

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground font-sans mb-4">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to={categoryPath} className="hover:text-primary transition-colors">{categoryLabel}</Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{article.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="category-badge">{categoryLabel}</span>
          </div>
          <h1 className="font-condensed text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3">
            {article.title}
          </h1>
          <p className="font-sans text-base text-muted-foreground leading-relaxed mb-4">
            {article.summary}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-sans border-t border-b border-border py-3">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {article.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(article.publicationDate)}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              {categoryLabel}
            </span>
            {isAdmin && (
              <div className="ml-auto">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="font-sans text-xs h-7"
                      disabled={deleteNewsMutation.isPending}
                    >
                      {deleteNewsMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <Trash2 className="w-3 h-3 mr-1" />
                      )}
                      Delete Article
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Article</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this article? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </header>

        {/* Featured image */}
        {article.imageData && (
          <div className="mb-6 overflow-hidden">
            <img
              src={article.imageData}
              alt={article.title}
              className="w-full max-h-[420px] object-cover"
            />
          </div>
        )}

        {/* Article content */}
        <article className="prose prose-sm max-w-none font-sans text-foreground leading-relaxed mb-8">
          {article.fullContent.split('\n').map((paragraph, i) =>
            paragraph.trim() ? (
              <p key={i} className="mb-4 text-foreground/90 leading-relaxed">
                {paragraph}
              </p>
            ) : null
          )}
        </article>

        {/* ── AD BANNER between content and reviews ── */}
        <div className="my-8">
          <AdBanner adSlot="3456789012" adFormat="horizontal" />
        </div>

        {/* Reviews section */}
        <ReviewsSection articleId={id} />

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-10 pt-6 border-t border-border">
            <div className="section-header mb-4">
              <h2 className="font-condensed text-lg font-bold text-foreground uppercase tracking-wide">
                Related Articles
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedArticles.map((related) => (
                <ArticleCard key={related.id} article={related} variant="newspaper" />
              ))}
            </div>
          </section>
        )}

        {/* Back navigation */}
        <div className="mt-8 pt-4 border-t border-border">
          <button
            onClick={() => navigate({ to: categoryPath })}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {categoryLabel}
          </button>
        </div>
      </div>
    </main>
  );
}
