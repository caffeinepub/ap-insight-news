import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type News, type Review, NewsCategory } from '../backend';

export function useGetAllNews() {
  const { actor, isFetching } = useActor();

  return useQuery<News[]>({
    queryKey: ['news', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      const articles = await actor.getAllNews();
      return [...articles].sort(
        (a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetNewsByCategory(category: NewsCategory) {
  const { actor, isFetching } = useActor();

  return useQuery<News[]>({
    queryKey: ['news', 'category', category],
    queryFn: async () => {
      if (!actor) return [];
      const articles = await actor.getNewsByCategory(category);
      return [...articles].sort(
        (a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetNewsById(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<News | null>({
    queryKey: ['news', 'id', id],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getNewsById(id);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddNews() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      title: string;
      summary: string;
      fullContent: string;
      category: NewsCategory;
      author: string;
      publicationDate: string;
      imageUrl: string | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addNews(
        params.id,
        params.title,
        params.summary,
        params.fullContent,
        params.category,
        params.author,
        params.publicationDate,
        params.imageUrl
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useDeleteNews() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteNews(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function usePurgeExpiredArticles() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.purgeExpiredArticles();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useGetReviewsByArticleId(articleId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['reviews', 'article', articleId],
    queryFn: async () => {
      if (!actor) return [];
      const reviews = await actor.getReviewsByArticleId(articleId);
      return [...reviews].sort((a, b) => Number(b.createdAt - a.createdAt));
    },
    enabled: !!actor && !isFetching && !!articleId,
  });
}

export function useGetAllReviews() {
  const { actor, isFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['reviews', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      const reviews = await actor.getAllReviews();
      return [...reviews].sort((a, b) => Number(b.createdAt - a.createdAt));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      articleId: string;
      reviewerName: string;
      rating: bigint;
      reviewText: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addReview(
        params.articleId,
        params.reviewerName,
        params.rating,
        params.reviewText
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'article', variables.articleId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'all'] });
    },
  });
}

export function useDeleteReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteReview(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
