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
          <span className="ml-1 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {reviews.length}
          </span>
        )}
      </div>

      {/* Reviews list */}
      {reviewsLoading ? (
        <div className="space-y-3 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-border p-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-3 mb-6">
          {reviews.map((review) => (
            <div key={String(review.id)} className="bg-white border border-border p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm uppercase">
                      {review.reviewerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground font-sans">
                      {review.reviewerName}
                    </p>
                    <p className="text-xs text-muted-foreground font-sans">
                      {formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <StarRating rating={Number(review.rating)} />
              </div>
              <p className="text-sm text-foreground font-sans leading-relaxed pl-10">
                {review.reviewText}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-secondary border border-border p-6 text-center mb-6">
          <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-sans">
            No reviews yet. Be the first to share your thoughts!
          </p>
        </div>
      )}

      {/* Review submission — requires login */}
      {isAuthenticated ? (
        <div className="bg-white border border-border p-5">
          <h3 className="font-condensed text-base font-bold text-foreground uppercase tracking-wide mb-4">
            Write a Review
          </h3>

          {successMsg && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 mb-4 rounded">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>Your review has been submitted successfully!</span>
            </div>
          )}

          {addReviewMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 mb-4 rounded">
              Failed to submit review. Please try again.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="reviewer-name" className="text-sm font-semibold text-foreground">
                Your Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="reviewer-name"
                placeholder="Enter your name..."
                value={reviewerName}
                onChange={(e) => {
                  setReviewerName(e.target.value);
                  if (formErrors.name) setFormErrors((p) => ({ ...p, name: undefined }));
                }}
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>

            {/* Rating */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-foreground">
                Rating <span className="text-primary">*</span>
              </Label>
              <div className="flex items-center gap-3">
                <StarRating
                  rating={rating}
                  interactive
                  onRate={(r) => {
                    setRating(r);
                    if (formErrors.rating) setFormErrors((p) => ({ ...p, rating: undefined }));
                  }}
                />
                {rating > 0 && (
                  <span className="text-xs text-muted-foreground font-sans">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </span>
                )}
              </div>
              {formErrors.rating && (
                <p className="text-xs text-destructive">{formErrors.rating}</p>
              )}
            </div>

            {/* Review text */}
            <div className="space-y-1">
              <Label htmlFor="review-text" className="text-sm font-semibold text-foreground">
                Review <span className="text-primary">*</span>
              </Label>
              <Textarea
                id="review-text"
                placeholder="Share your thoughts about this article..."
                value={reviewText}
                onChange={(e) => {
                  setReviewText(e.target.value);
                  if (formErrors.text) setFormErrors((p) => ({ ...p, text: undefined }));
                }}
                rows={4}
                className={formErrors.text ? 'border-destructive' : ''}
              />
              {formErrors.text && <p className="text-xs text-destructive">{formErrors.text}</p>}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={addReviewMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white font-semibold font-condensed uppercase tracking-wide px-6"
              >
                {addReviewMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-secondary border border-border p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-sm text-foreground font-sans mb-1">
              Want to leave a review?
            </p>
            <p className="text-xs text-muted-foreground font-sans">
              Log in to share your thoughts and rate this article.
            </p>
          </div>
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="bg-primary text-white font-condensed font-semibold uppercase tracking-wide hover:bg-primary/90 shrink-0"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in…
              </span>
            ) : (
              'Login to Review'
            )}
          </Button>
        </div>
      )}
    </section>
  );
}

function DeleteArticleButton({
  articleId,
  articleTitle,
}: {
  articleId: string;
  articleTitle: string;
}) {
  const navigate = useNavigate();
  const deleteNewsMutation = useDeleteNews();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteNewsMutation.mutateAsync(articleId);
      navigate({ to: '/' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete article.';
      setDeleteError(message);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
            disabled={deleteNewsMutation.isPending}
          >
            {deleteNewsMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Delete Article
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{articleTitle}"</strong>? This action cannot
              be undone and will permanently remove the article and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete Article
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
    </div>
  );
}

export default function ArticleDetailPage() {
  const { id } = useParams({ from: '/article/$id' });
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity;

  // Article is always loaded — no auth gate
  const { data: article, isLoading, isError } = useGetNewsById(id);

  const category = article?.category ?? NewsCategory.political;
  const { data: relatedArticles } = useGetNewsByCategory(category);

  // Check admin role
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (actor && isAuthenticated) {
      actor.isCallerAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [actor, isAuthenticated]);

  const backPath = article?.category === NewsCategory.political ? '/political' : '/movies';
  const backLabel = article?.category === NewsCategory.political ? 'Political News' : 'Movie News';

  const placeholderImage =
    article?.category === NewsCategory.political
      ? '/assets/generated/placeholder-political.dim_800x450.png'
      : '/assets/generated/placeholder-movie.dim_800x450.png';

  const related = relatedArticles?.filter((a) => a.id !== id).slice(0, 4) ?? [];

  // Loading skeleton
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

  // Error state
  if (isError || !article) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="font-condensed text-2xl font-bold text-foreground mb-2 uppercase tracking-wide">
            Article Not Found
          </h2>
          <p className="text-sm text-muted-foreground font-sans mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button className="bg-primary text-white font-condensed font-semibold uppercase tracking-wide hover:bg-primary/90">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  // Expired article state — shown instead of content
  if (isArticleExpired(article.expiresAt)) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Back link */}
          <Link
            to={backPath}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-sans mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>

          <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="font-condensed text-2xl font-bold text-foreground mb-2 uppercase tracking-wide">
              Article Expired
            </h2>
            <p className="text-sm text-muted-foreground font-sans mb-2 leading-relaxed">
              This article has expired and is no longer available. News articles are available for
              24 hours after publication.
            </p>
            <p className="text-xs text-muted-foreground/70 font-sans mb-6 italic">
              "{article.title}"
            </p>
            <Link to="/">
              <Button className="bg-primary text-white font-condensed font-semibold uppercase tracking-wide hover:bg-primary/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const categoryLabel = article.category === NewsCategory.political ? 'Political' : 'Movie';
  const categoryClass =
    article.category === NewsCategory.political
      ? 'bg-blue-100 text-blue-700'
      : 'bg-purple-100 text-purple-700';

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Back link + admin delete button row */}
        <div className="flex items-center justify-between mb-5">
          <Link
            to={backPath}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
          {isAdmin && (
            <DeleteArticleButton articleId={article.id} articleTitle={article.title} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main Article Content ── */}
          <article className="lg:col-span-2">
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wide ${categoryClass}`}>
                {categoryLabel}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-condensed text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4 uppercase tracking-tight">
              {article.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-sans mb-4 pb-4 border-b border-border">
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
            </div>

            {/* Hero image */}
            <div className="w-full mb-5 overflow-hidden">
              <img
                src={article.imageUrl ?? placeholderImage}
                alt={article.title}
                className="w-full h-56 sm:h-72 object-cover"
              />
            </div>

            {/* Summary */}
            <p className="text-base font-semibold text-foreground font-sans leading-relaxed mb-4 border-l-4 border-primary pl-4 bg-secondary py-3 pr-3">
              {article.summary}
            </p>

            {/* Full content */}
            <div className="prose prose-sm max-w-none font-sans text-foreground leading-relaxed">
              {article.fullContent.split('\n').map((para, i) =>
                para.trim() ? (
                  <p key={i} className="mb-4">
                    {para}
                  </p>
                ) : null
              )}
            </div>

            {/* Reviews section */}
            <ReviewsSection articleId={article.id} />
          </article>

          {/* ── Sidebar ── */}
          <aside className="space-y-6">
            {/* Related articles */}
            {related.length > 0 && (
              <div>
                <div className="section-header mb-3">
                  <h3 className="font-condensed text-sm font-bold uppercase tracking-widest text-foreground">
                    Related Stories
                  </h3>
                </div>
                <div className="space-y-3">
                  {related.map((rel) => (
                    <ArticleCard key={rel.id} article={rel} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
