import { apiClient } from './client';
import { WhiteLabelConfig } from '../types/whitelabel';

export const whitelabelApi = {
  /**
   * Consumes existing Django endpoint `/api/whitelabel/config`
   */
  async getConfig(): Promise<WhiteLabelConfig> {
    return apiClient.get<WhiteLabelConfig>('/api/whitelabel/config');
  },
};
