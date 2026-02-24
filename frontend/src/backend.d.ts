import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface News {
    id: string;
    title: string;
    fullContent: string;
    author: string;
    summary: string;
    imageUrl?: string;
    publicationDate: string;
    category: NewsCategory;
}
export enum NewsCategory {
    movie = "movie",
    political = "political"
}
export interface backendInterface {
    addNews(id: string, title: string, summary: string, fullContent: string, category: NewsCategory, author: string, publicationDate: string, imageUrl: string | null): Promise<void>;
    getAllNews(): Promise<Array<News>>;
    getNewsByCategory(category: NewsCategory): Promise<Array<News>>;
    getNewsById(id: string): Promise<News>;
}
