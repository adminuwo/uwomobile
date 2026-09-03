import { apiClient } from './client';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  stock?: number;
  status: 'ACTIVE' | 'ARCHIVED';
  image_url?: string;
  product_url?: string;
  currency: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export const productsApi = {
  async getProducts(params?: { limit?: number; offset?: number; search?: string }): Promise<ProductsResponse> {
    return apiClient.get<ProductsResponse>('/api/products/', { params });
  },
  
  async getProduct(id: string): Promise<Product> {
    return apiClient.get<Product>(`/api/products/${id}/`);
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    return apiClient.post<Product>('/api/products/', data);
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return apiClient.patch<Product>(`/api/products/${id}/`, data);
  },

  async deleteProduct(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/products/${id}/`);
  },
};
