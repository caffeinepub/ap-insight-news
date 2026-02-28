import React, { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import {
  useGetAllNews,
  useAddNews,
  useDeleteNews,
  usePurgeExpiredArticles,
  useAutoFetchNews,
  useFetchSpecificSource,
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
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Clock,
  Star,
  Upload,
  X,
  ImageIcon,
  RefreshCw,
  Globe,
  Zap,
} from 'lucide-react';

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
  imageData: string;
  sourceUrl: string;
}

const emptyForm: ArticleFormData = {
  title: '',
  summary: '',
  fullContent: '',
  category: NewsCategory.political,
  author: '',
  publicationDate: new Date().toISOString().split('T')[0],
  imageData: '',
  sourceUrl: '',
};

interface NewsSource {
  key: string;
  label: string;
  url: string;
}

const NEWS_SOURCES: NewsSource[] = [
  {
    key: 'Eenadu',
    label: 'Eenadu',
    url: 'https://www.eenadu.net',
  },
  {
    key: 'Sakshi',
    label: 'Sakshi',
    url: 'https://www.sakshi.com',
  },
  {
    key: 'Andhra Jyothy',
    label: 'Andhra Jyothy',
    url: 'https://www.andhrajyothy.com',
  },
];

interface SourceFetchState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [form, setForm] = useState<ArticleFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Per-source fetch state
  const [sourceStates, setSourceStates] = useState<Record<string, SourceFetchState>>({});
  const [fetchAllLoading, setFetchAllLoading] = useState(false);

  const { data: articles = [], isLoading: articlesLoading } = useGetAllNews();
  const addNewsMutation = useAddNews();
  const deleteNewsMutation = useDeleteNews();
  const purgeExpiredMutation = usePurgeExpiredArticles();
  const autoFetchMutation = useAutoFetchNews();
  const fetchSpecificSourceMutation = useFetchSpecificSource();

  const isAuthenticated = !!identity;

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    setFormError(null);
    setFormSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm((prev) => ({ ...prev, imageData: base64 }));
      setImagePreview(base64);
    };
    reader.onerror = () => {
      setFormError('Failed to read the selected image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imageData: '' }));
    setImagePreview(null);
    setImageFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        imageUrl: form.imageData || null,
        sourceUrl: form.sourceUrl.trim(),
      });
      setForm(emptyForm);
      setImagePreview(null);
      setImageFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const setSourceState = (key: string, state: SourceFetchState) => {
    setSourceStates((prev) => ({ ...prev, [key]: state }));
  };

  const handleFetchSource = async (source: NewsSource) => {
    setSourceState(source.key, { status: 'loading', message: '' });
    try {
      const result = await fetchSpecificSourceMutation.mutateAsync(source.key);
      const msg = result
        ? `Fetched successfully from ${source.label}.`
        : `Fetch complete for ${source.label}.`;
      setSourceState(source.key, { status: 'success', message: msg });
      toast.success(`${source.label}: ${msg}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      let displayMsg = `Failed to fetch from ${source.label}.`;
      if (message.includes('Unauthorized') || message.includes('admin')) {
        displayMsg = 'You do not have admin permissions to fetch news.';
      } else if (message.includes('already processed')) {
        displayMsg = `${source.label} was already fetched recently. No new articles added.`;
        setSourceState(source.key, { status: 'success', message: displayMsg });
        toast.info(displayMsg);
        return;
      } else {
        displayMsg = `${source.label}: ${message}`;
      }
      setSourceState(source.key, { status: 'error', message: displayMsg });
      toast.error(displayMsg);
    }
  };

  const handleFetchAllSources = async () => {
    setFetchAllLoading(true);
    const resetStates: Record<string, SourceFetchState> = {};
    NEWS_SOURCES.forEach((s) => {
      resetStates[s.key] = { status: 'loading', message: '' };
    });
    setSourceStates(resetStates);

    try {
      await autoFetchMutation.mutateAsync();
      NEWS_SOURCES.forEach((s) => {
        setSourceState(s.key, { status: 'success', message: `Fetched from ${s.label}.` });
      });
      toast.success('All sources fetched successfully! Article list has been refreshed.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      let displayMsg = 'Failed to fetch all sources.';
      if (message.includes('Unauthorized') || message.includes('admin')) {
        displayMsg = 'You do not have admin permissions to fetch news.';
      } else {
        displayMsg = `Fetch all failed: ${message}`;
      }
      NEWS_SOURCES.forEach((s) => {
        setSourceState(s.key, { status: 'error', message: displayMsg });
      });
      toast.error(displayMsg);
    } finally {
      setFetchAllLoading(false);
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
      <Toaster />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage news articles, reviews, and site settings.</p>
      </div>

      {/* ── Telugu News Auto-Fetch Section ── */}
      <section className="mb-10 bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-accent px-6 py-4 flex items-center gap-3">
          <Zap className="w-5 h-5 text-white" />
          <h2 className="text-lg font-bold text-white">Automated News Ingestion</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground mb-5">
            Fetch the latest Telugu news articles directly from Eenadu, Sakshi, and Andhra Jyothy.
            Use individual source buttons or fetch from all sources at once.
          </p>

          {/* Individual source cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {NEWS_SOURCES.map((source) => {
              const state = sourceStates[source.key];
              const isLoading = state?.status === 'loading';
              return (
                <div
                  key={source.key}
                  className="border border-border rounded-lg p-4 flex flex-col gap-3 bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-accent" />
                      <span className="font-semibold text-foreground text-sm">{source.label}</span>
                    </div>
                    {state?.status === 'success' && (
                      <span className="text-xs text-green-600 font-medium">✓ Done</span>
                    )}
                    {state?.status === 'error' && (
                      <span className="text-xs text-destructive font-medium">✗ Error</span>
                    )}
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-accent truncate"
                  >
                    {source.url}
                  </a>
                  {state?.message && (
                    <p
                      className={`text-xs rounded px-2 py-1 ${
                        state.status === 'success'
                          ? 'bg-green-50 text-green-700'
                          : state.status === 'error'
                            ? 'bg-red-50 text-destructive'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {state.message}
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFetchSource(source)}
                    disabled={isLoading || fetchAllLoading}
                    className="w-full mt-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                        Fetching…
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1.5" />
                        Fetch {source.label}
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Fetch All button */}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button
              onClick={handleFetchAllSources}
              disabled={fetchAllLoading || autoFetchMutation.isPending}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              {fetchAllLoading || autoFetchMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching All Sources…
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Fetch All Sources
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Fetches from Eenadu, Sakshi, and Andhra Jyothy simultaneously.
            </p>
          </div>
        </div>
      </section>

      {/* ── Add Article Form ── */}
      <section className="mb-10 bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-foreground px-6 py-4 flex items-center gap-3">
          <Plus className="w-5 h-5 text-white" />
          <h2 className="text-lg font-bold text-white">Add New Article</h2>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {formError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-destructive rounded px-3 py-2 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded px-3 py-2 text-sm">
              {formSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="Article title"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="summary">Summary *</Label>
              <Textarea
                id="summary"
                name="summary"
                value={form.summary}
                onChange={handleFormChange}
                placeholder="Brief summary of the article"
                rows={2}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="fullContent">Full Content *</Label>
              <Textarea
                id="fullContent"
                name="fullContent"
                value={form.fullContent}
                onChange={handleFormChange}
                placeholder="Full article content"
                rows={5}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                name="author"
                value={form.author}
                onChange={handleFormChange}
                placeholder="Author name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="publicationDate">Publication Date *</Label>
              <Input
                id="publicationDate"
                name="publicationDate"
                type="date"
                value={form.publicationDate}
                onChange={handleFormChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={form.category === NewsCategory.movie ? 'movie' : 'political'}
                onChange={handleCategoryChange}
                className="mt-1 w-full border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="political">Political</option>
                <option value="movie">Movie</option>
              </select>
            </div>
            <div>
              <Label htmlFor="sourceUrl">Source URL (optional)</Label>
              <Input
                id="sourceUrl"
                name="sourceUrl"
                value={form.sourceUrl}
                onChange={handleFormChange}
                placeholder="https://example.com/article"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Article Image (optional)</Label>
              <div className="mt-1">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 w-32 object-cover rounded border border-border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {imageFileName && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-[8rem]">
                        {imageFileName}
                      </p>
                    )}
                  </div>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded px-3 py-2 text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors w-fit">
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload image</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={addNewsMutation.isPending || actorFetching}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              {addNewsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Add Article
                </>
              )}
            </Button>
          </div>
        </form>
      </section>

      {/* ── Article Management ── */}
      <section className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-foreground">All Articles</h2>
            <Badge variant="secondary">{articles.length}</Badge>
            {expiredCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {expiredCount} expired
              </Badge>
            )}
          </div>
          {expiredCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={purgeExpiredMutation.isPending}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                >
                  {purgeExpiredMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-1" />
                  )}
                  Purge Expired
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Purge Expired Articles?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {expiredCount} expired article(s). This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handlePurge}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Purge
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {articlesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span className="ml-2 text-muted-foreground">Loading articles…</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No articles yet. Add one above or fetch from a news source.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {articles.map((article) => {
              const expired = isExpired(article.expiresAt);
              return (
                <div
                  key={article.id}
                  className={`px-6 py-4 flex items-start justify-between gap-4 ${expired ? 'opacity-60 bg-muted/30' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge
                        variant={
                          article.category === NewsCategory.movie ? 'secondary' : 'default'
                        }
                        className="text-xs"
                      >
                        {article.category === NewsCategory.movie ? 'Movie' : 'Political'}
                      </Badge>
                      {expired && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                      {article.sourceUrl && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {article.sourceUrl}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      By {article.author} · {article.publicationDate}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      Expires: {formatExpiry(article.expiresAt)}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deleteNewsMutation.isPending}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        {deleteNewsMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{article.title}"? This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(article.id)}
                          className="bg-destructive hover:bg-destructive/90"
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
