import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import {
  useGetAllNews,
  useAddNews,
  useDeleteNews,
  usePurgeExpiredArticles,
} from '../hooks/useQueries';
import { NewsCategory } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Trash2, Plus, Loader2, AlertCircle, Clock, Newspaper, Star } from 'lucide-react';

function formatExpiry(expiresAt: bigint): string {
  const ms = Number(expiresAt) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleString();
}

function isExpired(expiresAt: bigint): boolean {
  const ms = Number(expiresAt) / 1_000_000;
  return Date.now() > ms;
}

function generateId(): string {
  return `article-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ArticleFormData {
  title: string;
  summary: string;
  fullContent: string;
  category: NewsCategory;
  author: string;
  publicationDate: string;
  imageUrl: string;
}

const emptyForm: ArticleFormData = {
  title: '',
  summary: '',
  fullContent: '',
  category: NewsCategory.political,
  author: '',
  publicationDate: new Date().toISOString().split('T')[0],
  imageUrl: '',
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [form, setForm] = useState<ArticleFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const { data: articles = [], isLoading: articlesLoading } = useGetAllNews();
  const addNewsMutation = useAddNews();
  const deleteNewsMutation = useDeleteNews();
  const purgeExpiredMutation = usePurgeExpiredArticles();

  const isAuthenticated = !!identity;

  // Count expired articles (backend filters them, so this will always be 0 from getAllNews)
  // We show the purge button regardless for admin convenience
  const expiredCount = articles.filter((a) => isExpired(a.expiresAt)).length;

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
    setFormSuccess(null);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      category: e.target.value === 'movie' ? NewsCategory.movie : NewsCategory.political,
    }));
    setFormError(null);
  };

  const validateForm = (): string | null => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.summary.trim()) return 'Summary is required.';
    if (!form.fullContent.trim()) return 'Full content is required.';
    if (!form.author.trim()) return 'Author is required.';
    if (!form.publicationDate.trim()) return 'Publication date is required.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!isAuthenticated) {
      setFormError('You must be logged in to add articles.');
      return;
    }

    if (!actor) {
      setFormError('Backend connection not ready. Please wait and try again.');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      await addNewsMutation.mutateAsync({
        id: generateId(),
        title: form.title.trim(),
        summary: form.summary.trim(),
        fullContent: form.fullContent.trim(),
        category: form.category,
        author: form.author.trim(),
        publicationDate: form.publicationDate.trim(),
        imageUrl: form.imageUrl.trim() || null,
      });
      setForm(emptyForm);
      setFormSuccess('Article added successfully! It will expire in 7 days.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('Unauthorized') || message.includes('admin')) {
        setFormError('You do not have admin permissions to add articles.');
      } else {
        setFormError(`Failed to add article: ${message}`);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNewsMutation.mutateAsync(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Delete failed:', message);
    }
  };

  const handlePurge = async () => {
    try {
      await purgeExpiredMutation.mutateAsync();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Purge failed:', message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-accent mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Admin Access Required</h2>
        <p className="text-muted-foreground mb-6">
          You must be logged in with an admin account to access this page.
        </p>
        <Button onClick={() => navigate({ to: '/' })}>Go to Homepage</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage articles and content</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/admin/reviews' })}
          className="flex items-center gap-2"
        >
          <Star className="w-4 h-4" />
          Manage Reviews
        </Button>
      </div>

      {/* Add New Article Form */}
      <section className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold text-foreground">Add New Article</h2>
        </div>

        <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>Articles automatically expire after <strong>7 days</strong> from publication.</span>
        </div>

        {formError && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
            <span>✓ {formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="Article headline"
                disabled={addNewsMutation.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="author">Author <span className="text-destructive">*</span></Label>
              <Input
                id="author"
                name="author"
                value={form.author}
                onChange={handleFormChange}
                placeholder="Author name"
                disabled={addNewsMutation.isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
              <select
                id="category"
                name="category"
                value={form.category === NewsCategory.movie ? 'movie' : 'political'}
                onChange={handleCategoryChange}
                disabled={addNewsMutation.isPending}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
              >
                <option value="political">Political</option>
                <option value="movie">Movie</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="publicationDate">Publication Date <span className="text-destructive">*</span></Label>
              <Input
                id="publicationDate"
                name="publicationDate"
                type="date"
                value={form.publicationDate}
                onChange={handleFormChange}
                disabled={addNewsMutation.isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="summary">Summary <span className="text-destructive">*</span></Label>
            <Textarea
              id="summary"
              name="summary"
              value={form.summary}
              onChange={handleFormChange}
              placeholder="Brief summary of the article (shown in listings)"
              rows={2}
              disabled={addNewsMutation.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullContent">Full Content <span className="text-destructive">*</span></Label>
            <Textarea
              id="fullContent"
              name="fullContent"
              value={form.fullContent}
              onChange={handleFormChange}
              placeholder="Full article content"
              rows={6}
              disabled={addNewsMutation.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">Image URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleFormChange}
              placeholder="https://example.com/image.jpg"
              disabled={addNewsMutation.isPending}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={addNewsMutation.isPending || actorFetching}
              className="min-w-[140px]"
            >
              {addNewsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Publish Article
                </>
              )}
            </Button>
          </div>
        </form>
      </section>

      {/* Manage Articles */}
      <section className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-foreground">Manage Articles</h2>
            {!articlesLoading && (
              <Badge variant="secondary" className="ml-1">
                {articles.length}
              </Badge>
            )}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={purgeExpiredMutation.isPending}
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                {purgeExpiredMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Purge Expired
                {expiredCount > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {expiredCount}
                  </Badge>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Purge Expired Articles</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all expired articles from the database. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handlePurge}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Purge All Expired
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {articlesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading articles...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No articles found. Add your first article above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => {
              const expired = isExpired(article.expiresAt);
              return (
                <div
                  key={article.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    expired
                      ? 'border-border/50 bg-muted/30 opacity-60'
                      : 'border-border bg-background'
                  }`}
                >
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-16 h-12 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3
                        className={`font-semibold text-sm leading-tight ${
                          expired ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {article.title}
                      </h3>
                      {expired && (
                        <Badge variant="destructive" className="text-xs flex-shrink-0">
                          Expired
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-xs flex-shrink-0 capitalize"
                      >
                        {article.category === NewsCategory.movie ? 'Movie' : 'Political'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      By {article.author} · {article.publicationDate}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires: {formatExpiry(article.expiresAt)}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                        disabled={deleteNewsMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Article</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{article.title}"? This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(article.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
