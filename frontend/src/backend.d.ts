import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Review {
    id: bigint;
    createdAt: Time;
    reviewText: string;
    reviewerName: string;
    articleId: string;
    rating: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface LiveStatus {
    startedAt?: Time;
    isLive: boolean;
}
export interface News {
    id: string;
    title: string;
    expiresAt: Time;
    imageData?: string;
    fullContent: string;
    createdAt: Time;
    sourceUrl: string;
    author: string;
    summary: string;
    publicationDate: string;
    category: NewsCategory;
}
export interface NewsItemDTO {
    title: string;
    content: string;
    sourceUrl: string;
    author: string;
    summary: string;
    publicationDate: string;
    category: string;
}
export interface UserProfile {
    name: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum NewsCategory {
    movie = "movie",
    political = "political"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBulkNews(newsItems: Array<NewsItemDTO>): Promise<void>;
    addNews(id: string, title: string, summary: string, fullContent: string, category: NewsCategory, author: string, publicationDate: string, imageData: string | null, sourceUrl: string): Promise<void>;
    addReview(articleId: string, reviewerName: string, rating: bigint, reviewText: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteNews(id: string): Promise<void>;
    deleteReview(id: bigint): Promise<void>;
    fetchAndReloadAllNews(): Promise<void>;
    fetchSpecificSource(sourceName: string): Promise<string>;
    getAllNews(): Promise<Array<News>>;
    getAllReviews(): Promise<Array<Review>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLiveStatus(): Promise<LiveStatus>;
    getNewsByCategory(category: NewsCategory): Promise<Array<News>>;
    getNewsById(id: string): Promise<News>;
    getRecentReviews(limit: bigint): Promise<Array<Review>>;
    getReviewsByArticleId(articleId: string): Promise<Array<Review>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isConnected(): Promise<boolean>;
    purgeExpiredArticles(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleLiveStatus(): Promise<LiveStatus>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
