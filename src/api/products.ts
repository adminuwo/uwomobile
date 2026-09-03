import { apiClient } from './client';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock?: number;
  status: 'ACTIVE' | 'ARCHIVED';
  image_url?: string;
  currency: string;
}

export const productsApi = {
  async getProducts(): Promise<Product[]> {
    return apiClient.get<Product[]>('/api/products/');
  },
  
  async getProduct(id: string): Promise<Product> {
    return apiClient.get<Product>(`/api/products/${id}/`);
  }
};
