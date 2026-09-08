import { apiClient } from './client';

export interface OrderItem {
  id?: string;
  product_id?: string;
  name?: string;
  description?: string;
  quantity: number;
  price?: number;
  unit_price?: number;
  total?: number;
}

export interface Order {
  id: string;
  customer?: string;
  contact_name?: string;
  contact_phone?: string;
  items: OrderItem[];
  total_amount: number;
  currency?: string;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED';
  payment_method?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

export const ordersApi = {
  async getOrders(params?: { limit?: number; offset?: number; search?: string }): Promise<OrdersResponse | Order[]> {
    return apiClient.get<OrdersResponse | Order[]>('/api/orders/', { params });
  },

  async getOrder(id: string): Promise<Order> {
    return apiClient.get<Order>(`/api/orders/${id}/`);
  }
};
