import { apiClient } from './client';

export interface NewsArticle {
  title: string;
  link: string;
  pub_date: string;
  snippet: string;
  source: string;
}

export interface NewsFeedResponse {
  articles: NewsArticle[];
}

export const newsApi = {
  async getNewsFeed(query: string = 'technology'): Promise<NewsFeedResponse> {
    return apiClient.get<NewsFeedResponse>(`/api/google-news/feed?query=${encodeURIComponent(query)}`);
  }
};
