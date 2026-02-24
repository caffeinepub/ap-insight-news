import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Star, Trash2, Loader2, AlertCircle, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { useGetAllReviews, useDeleteReview } from '../hooks/useQueries';
import type { Review } from '../backend';

function formatReviewDate(nanoseconds: bigint): string {
  try {
    const ms = Number(nanoseconds / BigInt(1_000_000));
    return new Date(ms).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/30'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground font-sans">({rating}/5)</span>
    </div>
  );
}

function ReviewRow({ review, onDelete }: { review: Review; onDelete: (id: bigint) => void }) {
  const deleteReviewMutation = useDeleteReview();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteReviewMutation.mutateAsync(review.id);
      onDelete(review.id);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-border p-4 flex flex-col sm:flex-row sm:items-start gap-3">
      {/* Left: reviewer info */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-sm uppercase">
            {review.reviewerName.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
            <span className="font-semibold text-sm text-foreground font-sans">{review.reviewerName}</span>
            <StarDisplay rating={Number(review.rating)} />
            <span className="text-xs text-muted-foreground font-sans">{formatReviewDate(review.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs text-muted-foreground font-sans">Article:</span>
            <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded text-foreground truncate max-w-xs">
              {review.articleId}
            </span>
          </div>
          <p className="text-sm text-foreground font-sans leading-relaxed line-clamp-3">{review.reviewText}</p>
        </div>
      </div>

      {/* Right: delete button */}
      <div className="shrink-0 self-start sm:self-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span className="ml-1.5">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Review</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this review by <strong>{review.reviewerName}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const { data: reviews, isLoading, isError } = useGetAllReviews();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const visibleReviews = reviews?.filter((r) => !deletedIds.has(String(r.id))) ?? [];

  const handleDelete = (id: bigint) => {
    setDeletedIds((prev) => new Set([...prev, String(id)]));
  };

  return (
    <main className="bg-secondary min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary font-sans transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Admin
              </Link>
            </div>
            <h1 className="font-condensed text-3xl font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-primary" />
              Manage Reviews
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and moderate all reader reviews across articles.
            </p>
          </div>
          {reviews && (
            <div className="bg-white border border-border px-4 py-3 text-center shrink-0">
              <div className="font-condensed text-2xl font-bold text-primary">{visibleReviews.length}</div>
              <div className="text-xs text-muted-foreground font-sans">Total Reviews</div>
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-border p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load reviews. Please refresh the page.</AlertDescription>
          </Alert>
        )}

        {/* Empty state */}
        {!isLoading && !isError && visibleReviews.length === 0 && (
          <div className="bg-white border border-border p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-condensed text-lg font-bold text-foreground uppercase tracking-wide mb-2">
              No Reviews Yet
            </h3>
            <p className="text-sm text-muted-foreground font-sans">
              Reader reviews will appear here once articles receive feedback.
            </p>
          </div>
        )}

        {/* Reviews list */}
        {!isLoading && !isError && visibleReviews.length > 0 && (
          <div className="space-y-3">
            {visibleReviews.map((review) => (
              <ReviewRow key={String(review.id)} review={review} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
