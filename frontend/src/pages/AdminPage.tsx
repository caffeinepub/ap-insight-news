import { useState, useRef, useEffect } from 'react';
import { useAddNews, useGetAllNews, useDeleteNews, usePurgeExpiredArticles } from '../hooks/useQueries';
import { NewsCategory } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import {
  ImagePlus,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Trash2,
  Newspaper,
  Clock,
  Flame,
} from 'lucide-react';
import type { News } from '../backend';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface FormState {
  title: string;
  summary: string;
  fullContent: string;
  category: NewsCategory | '';
  author: string;
  publicationDate: string;
}

const initialForm: FormState = {
  title: '',
  summary: '',
  fullContent: '',
  category: '',
  author: '',
  publicationDate: new Date().toISOString().split('T')[0],
};

/** Convert nanosecond bigint timestamp to JS Date */
function nsToDate(ns: bigint): Date {
  return new Date(Number(ns / BigInt(1_000_000)));
}

/** Format expiry timestamp for display */
function formatExpiry(expiresAt: bigint): string {
  try {
    return nsToDate(expiresAt).toLocaleString('en-IN', {
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

/** Returns true if the article is expired (expiresAt is in the past) */
function isExpired(expiresAt: bigint): boolean {
  return nsToDate(expiresAt) < new Date();
}

function ArticleDeleteRow({ article }: { article: News }) {
  const deleteNewsMutation = useDeleteNews();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteNewsMutation.mutateAsync(article.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete article.';
      setDeleteError(message);
    }
  };

  const categoryLabel = article.category === NewsCategory.political ? 'Political' : 'Movie';
  const categoryClass =
    article.category === NewsCategory.political
      ? 'bg-blue-100 text-blue-700'
      : 'bg-purple-100 text-purple-700';

  const expired = isExpired(article.expiresAt);
  const expiryText = formatExpiry(article.expiresAt);

  return (
    <div
      className={`flex items-start gap-3 py-3 border-b border-border last:border-b-0 ${
        expired ? 'opacity-60' : ''
      }`}
    >
      {/* Thumbnail */}
      <div className="w-16 h-12 shrink-0 bg-secondary border border-border overflow-hidden rounded-sm">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt=""
            className={`w-full h-full object-cover ${expired ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-sm font-semibold font-sans leading-snug line-clamp-1 ${
              expired ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
          >
            {article.title}
          </p>
          {expired && (
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-200 shrink-0">
              Expired
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${categoryClass}`}>
            {categoryLabel}
          </span>
          <span className="text-xs text-muted-foreground font-sans">{article.author}</span>
          <span className="text-xs text-muted-foreground font-sans">{article.publicationDate}</span>
        </div>
        {/* Expiry timestamp */}
        <div className="flex items-center gap-1 mt-1">
          <Clock className={`w-3 h-3 ${expired ? 'text-amber-500' : 'text-muted-foreground/60'}`} />
          <span
            className={`text-xs font-sans ${
              expired ? 'text-amber-600 font-medium' : 'text-muted-foreground/70'
            }`}
          >
            {expired ? `Expired: ${expiryText}` : `Expires: ${expiryText}`}
          </span>
        </div>
        {deleteError && (
          <p className="text-xs text-destructive mt-1">{deleteError}</p>
        )}
      </div>

      {/* Delete button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            disabled={deleteNewsMutation.isPending}
            aria-label="Delete article"
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
              Are you sure you want to delete <strong>"{article.title}"</strong>? This action cannot
              be undone and will permanently remove the article.
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
    </div>
  );
}

export default function AdminPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentFileInputRef = useRef<HTMLInputElement>(null);

  const addNewsMutation = useAddNews();
  const { data: allArticles, isLoading: articlesLoading } = useGetAllNews();
  const purgeExpiredMutation = usePurgeExpiredArticles();

  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (actor && isAuthenticated) {
      actor.isCallerAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [actor, isAuthenticated]);

  const expiredCount = allArticles?.filter((a) => isExpired(a.expiresAt)).length ?? 0;

  const handlePurge = async () => {
    setPurgeError(null);
    setPurgeSuccess(false);
    try {
      await purgeExpiredMutation.mutateAsync();
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to purge expired articles.';
      setPurgeError(message);
    }
  };

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImageDataUrl(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleContentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setForm((prev) => ({ ...prev, fullContent: text }));
      if (validationErrors.fullContent) {
        setValidationErrors((prev) => ({ ...prev, fullContent: undefined }));
      }
    };
    reader.readAsText(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageDataUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) errors.title = 'Title is required.';
    if (!form.summary.trim()) errors.summary = 'Summary is required.';
    if (!form.fullContent.trim()) errors.fullContent = 'Full content is required.';
    if (!form.category) errors.category = 'Category is required.';
    if (!form.author.trim()) errors.author = 'Author is required.';
    if (!form.publicationDate) errors.publicationDate = 'Publication date is required.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!validate()) return;

    const id = `article-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      await addNewsMutation.mutateAsync({
        id,
        title: form.title.trim(),
        summary: form.summary.trim(),
        fullContent: form.fullContent.trim(),
        category: form.category as NewsCategory,
        author: form.author.trim(),
        publicationDate: form.publicationDate,
        imageUrl: imageDataUrl,
      });
      setSuccessMsg(`Article "${form.title}" published successfully!`);
      setForm(initialForm);
      setImagePreview(null);
      setImageDataUrl(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (contentFileInputRef.current) contentFileInputRef.current.value = '';
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to publish article. Please try again.';
      setErrorMsg(message);
    }
  };

  return (
    <main className="bg-secondary min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-condensed text-3xl font-bold text-foreground uppercase tracking-wide">
            Admin — Content Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage articles: add new content, delete or purge expired articles.
          </p>
        </div>

        {/* ── Manage Articles Section ── */}
        <Card className="shadow-news border border-border mb-8">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="font-condensed text-xl uppercase tracking-wide text-foreground flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-primary" />
                  Manage Articles
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  {allArticles
                    ? `${allArticles.length} article${allArticles.length !== 1 ? 's' : ''} published${expiredCount > 0 ? ` · ${expiredCount} expired` : ''}`
                    : 'Loading articles…'}
                </CardDescription>
              </div>

              {/* Purge Expired button — admin only */}
              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={purgeExpiredMutation.isPending || expiredCount === 0}
                      className="flex items-center gap-1.5 border-amber-400 text-amber-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-500 disabled:opacity-50 transition-colors"
                    >
                      {purgeExpiredMutation.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Purging…
                        </>
                      ) : (
                        <>
                          <Flame className="w-3.5 h-3.5" />
                          Purge Expired
                          {expiredCount > 0 && (
                            <span className="ml-1 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                              {expiredCount}
                            </span>
                          )}
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Purge Expired Articles?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all <strong>{expiredCount}</strong> expired
                        article{expiredCount !== 1 ? 's' : ''} from the system. This action cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handlePurge}
                        className="bg-amber-600 text-white hover:bg-amber-700"
                      >
                        Purge Expired
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Purge feedback */}
            {purgeSuccess && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-xs px-3 py-2 mt-3 rounded">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span>Expired articles purged successfully.</span>
              </div>
            )}
            {purgeError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 text-xs px-3 py-2 mt-3 rounded">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>{purgeError}</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-4">
            {articlesLoading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-sans">Loading articles…</span>
              </div>
            ) : allArticles && allArticles.length > 0 ? (
              <div>
                {allArticles.map((article) => (
                  <ArticleDeleteRow key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Newspaper className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-sans">No articles published yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Add Article Section ── */}
        {/* Success / Error Alerts */}
        {successMsg && (
          <Alert className="mb-5 border-green-500 bg-green-50 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Published!</AlertTitle>
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}
        {errorMsg && (
          <Alert variant="destructive" className="mb-5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Card className="shadow-news border border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="font-condensed text-xl uppercase tracking-wide text-foreground">
                Add New Article
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                All fields marked with * are required. Articles expire automatically after 24 hours.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-5">
              {/* Title */}
              <div className="space-y-1">
                <Label htmlFor="title" className="text-sm font-semibold text-foreground">
                  Title <span className="text-primary">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter article headline..."
                  value={form.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className={validationErrors.title ? 'border-destructive' : ''}
                />
                {validationErrors.title && (
                  <p className="text-xs text-destructive">{validationErrors.title}</p>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <Label htmlFor="summary" className="text-sm font-semibold text-foreground">
                  Summary <span className="text-primary">*</span>
                </Label>
                <Textarea
                  id="summary"
                  placeholder="Brief summary of the article (shown in cards)..."
                  value={form.summary}
                  onChange={(e) => handleFieldChange('summary', e.target.value)}
                  rows={3}
                  className={validationErrors.summary ? 'border-destructive' : ''}
                />
                {validationErrors.summary && (
                  <p className="text-xs text-destructive">{validationErrors.summary}</p>
                )}
              </div>

              {/* Full Content */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fullContent" className="text-sm font-semibold text-foreground">
                    Full Content <span className="text-primary">*</span>
                  </Label>
                  {/* Upload Content Button */}
                  <button
                    type="button"
                    onClick={() => contentFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors border border-primary/30 rounded px-2 py-1 hover:bg-primary/5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Upload Content (.txt)
                  </button>
                  <input
                    ref={contentFileInputRef}
                    type="file"
                    accept=".txt,text/plain"
                    className="hidden"
                    onChange={handleContentFileUpload}
                  />
                </div>
                <Textarea
                  id="fullContent"
                  placeholder="Write or paste the full article content here, or upload a .txt file above..."
                  value={form.fullContent}
                  onChange={(e) => handleFieldChange('fullContent', e.target.value)}
                  rows={10}
                  className={`font-sans text-sm leading-relaxed ${validationErrors.fullContent ? 'border-destructive' : ''}`}
                />
                {validationErrors.fullContent && (
                  <p className="text-xs text-destructive">{validationErrors.fullContent}</p>
                )}
              </div>

              {/* Category + Author row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <Label htmlFor="category" className="text-sm font-semibold text-foreground">
                    Category <span className="text-primary">*</span>
                  </Label>
                  <Select
                    value={form.category}
                    onValueChange={(val) => handleFieldChange('category', val)}
                  >
                    <SelectTrigger
                      id="category"
                      className={validationErrors.category ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NewsCategory.political}>Political</SelectItem>
                      <SelectItem value={NewsCategory.movie}>Movie</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.category && (
                    <p className="text-xs text-destructive">{validationErrors.category}</p>
                  )}
                </div>

                {/* Author */}
                <div className="space-y-1">
                  <Label htmlFor="author" className="text-sm font-semibold text-foreground">
                    Author <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="author"
                    placeholder="Author name..."
                    value={form.author}
                    onChange={(e) => handleFieldChange('author', e.target.value)}
                    className={validationErrors.author ? 'border-destructive' : ''}
                  />
                  {validationErrors.author && (
                    <p className="text-xs text-destructive">{validationErrors.author}</p>
                  )}
                </div>
              </div>

              {/* Publication Date */}
              <div className="space-y-1">
                <Label htmlFor="publicationDate" className="text-sm font-semibold text-foreground">
                  Publication Date <span className="text-primary">*</span>
                </Label>
                <Input
                  id="publicationDate"
                  type="date"
                  value={form.publicationDate}
                  onChange={(e) => handleFieldChange('publicationDate', e.target.value)}
                  className={`w-full sm:w-48 ${validationErrors.publicationDate ? 'border-destructive' : ''}`}
                />
                {validationErrors.publicationDate && (
                  <p className="text-xs text-destructive">{validationErrors.publicationDate}</p>
                )}
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Article Image <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>

                {imagePreview ? (
                  <div className="relative w-full max-w-sm">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover border border-border rounded-sm"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full max-w-sm h-32 border-2 border-dashed border-border hover:border-primary/50 rounded-sm bg-secondary hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <ImagePlus className="w-8 h-8 text-muted-foreground/40 mb-2" />
                    <span className="text-xs text-muted-foreground font-sans">
                      Click to upload image
                    </span>
                    <span className="text-xs text-muted-foreground/60 font-sans mt-0.5">
                      JPG, PNG, GIF, WebP
                    </span>
                  </button>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Expiry notice */}
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 font-sans">
                  This article will automatically expire <strong>24 hours</strong> after publication
                  and will no longer be visible to readers.
                </p>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={addNewsMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold font-condensed uppercase tracking-wide px-8"
                >
                  {addNewsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Publish Article
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  );
}
