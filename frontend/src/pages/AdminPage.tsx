import { useState, useRef } from 'react';
import { useAddNews } from '../hooks/useQueries';
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
import { ImagePlus, FileText, Upload, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

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

export default function AdminPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentFileInputRef = useRef<HTMLInputElement>(null);

  const addNewsMutation = useAddNews();

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
      const message = err instanceof Error ? err.message : 'Failed to publish article. Please try again.';
      setErrorMsg(message);
    }
  };

  return (
    <main className="bg-secondary min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-condensed text-3xl font-bold text-foreground uppercase tracking-wide">
            Admin — Add Article
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the details below to publish a new article to the site.
          </p>
        </div>

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
                Article Details
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                All fields marked with * are required.
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

                {/* Upload trigger */}
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-2 border-primary/40 text-primary hover:bg-primary/5 hover:text-primary"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Upload Image
                  </Button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
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

                {/* Image Preview */}
                {imagePreview ? (
                  <div className="relative mt-2 rounded overflow-hidden border border-border w-full max-w-sm">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={clearImage}
                        className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="mt-2 flex flex-col items-center justify-center w-full max-w-sm h-36 border-2 border-dashed border-border rounded cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload an image</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">PNG, JPG, GIF, WebP</p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Article will be published immediately upon submission.
                </p>
                <Button
                  type="submit"
                  disabled={addNewsMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-6"
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
