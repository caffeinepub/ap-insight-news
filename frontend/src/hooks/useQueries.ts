import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { NewsCategory, type News, type LiveStatus } from '../backend';

export function useGetAllNews() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['news', 'all'],
    queryFn: async () => {
      if (!actor) return [] as News[];
      return actor.getAllNews();
    },
    enabled: !!actor && !actorFetching,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useGetNewsByCategory(category: NewsCategory) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['news', 'category', category],
    queryFn: async () => {
      if (!actor) return [] as News[];
      return actor.getNewsByCategory(category);
    },
    enabled: !!actor && !actorFetching,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useGetNewsById(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['news', 'id', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getNewsById(id);
    },
    enabled: !!actor && !actorFetching && !!id,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useAddNews() {
  const { actor, isFetching: actorFetching } = useActor();
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
      sourceUrl: string;
    }) => {
      if (!actor || actorFetching) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      await actor.addNews(
        params.id,
        params.title,
        params.summary,
        params.fullContent,
        params.category,
        params.author,
        params.publicationDate,
        params.imageUrl,
        params.sourceUrl
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useDeleteNews() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor || actorFetching) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      await actor.deleteNews(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function usePurgeExpiredArticles() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor || actorFetching) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      await actor.purgeExpiredArticles();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useAutoFetchNews() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor || actorFetching) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      await actor.fetchAndReloadAllNews();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useFetchSpecificSource() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceName: string) => {
      if (!actor || actorFetching) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      const result = await actor.fetchSpecificSource(sourceName);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useGetReviewsByArticleId(articleId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['reviews', 'article', articleId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReviewsByArticleId(articleId);
    },
    enabled: !!actor && !actorFetching && !!articleId,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useGetAllReviews() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['reviews', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReviews();
    },
    enabled: !!actor && !actorFetching,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useAddReview() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      articleId: string;
      reviewerName: string;
      rating: bigint;
      reviewText: string;
    }) => {
      if (!actor || actorFetching) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
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
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor || actorFetching) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      await actor.deleteReview(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 0,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !actorFetching && query.isFetched,
    data: query.data ?? false,
  };
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useSaveCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { name: string }) => {
      if (!actor || actorFetching) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useAssignCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { user: import('@dfinity/principal').Principal; role: import('../backend').UserRole }) => {
      if (!actor || actorFetching) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      await actor.assignCallerUserRole(params.user, params.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}

export function useGetLiveStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<LiveStatus>({
    queryKey: ['liveStatus'],
    queryFn: async () => {
      if (!actor) return { isLive: false } as LiveStatus;
      return actor.getLiveStatus();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useToggleLiveStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor || actorFetching) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      const result = await actor.toggleLiveStatus();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveStatus'] });
    },
    onError: (error) => {
      console.error('Failed to toggle live status:', error);
    },
  });
}
