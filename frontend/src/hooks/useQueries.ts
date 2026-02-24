import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { NewsCategory } from '../backend';

export function useGetAllNews() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['news', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetNewsByCategory(category: NewsCategory) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['news', 'category', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNewsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetNewsById(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['news', 'id', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getNewsById(id);
    },
    enabled: !!actor && !isFetching && !!id,
    retry: false,
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
      if (!actor) throw new Error('Actor not initialized. Please make sure you are logged in.');
      await actor.addNews(
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
      await actor.deleteNews(id);
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
      await actor.purgeExpiredArticles();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useGetReviewsByArticleId(articleId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['reviews', 'article', articleId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReviewsByArticleId(articleId);
    },
    enabled: !!actor && !isFetching && !!articleId,
  });
}

export function useGetAllReviews() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['reviews', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReviews();
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
    },
  });
}

export function useDeleteReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.deleteReview(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
