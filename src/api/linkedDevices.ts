import { apiClient } from './client';

export interface LinkedDeviceItem {
  id: string;
  device_name: string;
  browser: string;
  operating_system: string;
  ip_address?: string;
  linked_at: string;
  last_active_at: string;
  is_active: boolean;
}

export interface QrScanResult {
  session_id: string;
  status: string;
  device_name: string;
  browser: string;
  operating_system: string;
  ip_address?: string;
  scanned_at: string;
}

export interface QrApproveResult {
  message: string;
  device_id: string;
  device_name: string;
}

export const linkedDevicesApi = {
  // Scans QR session code and gets browser/OS metadata
  scanQr: async (sessionId: string): Promise<QrScanResult> => {
    return apiClient.post<QrScanResult>('/api/auth/qr/scan/', { session_id: sessionId });
  },

  // Approves QR login session and creates linked device
  approveQr: async (sessionId: string): Promise<QrApproveResult> => {
    return apiClient.post<QrApproveResult>('/api/auth/qr/approve/', { session_id: sessionId });
  },

  // Rejects QR login session
  rejectQr: async (sessionId: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/api/auth/qr/reject/', { session_id: sessionId });
  },

  // Retrieves list of active linked devices
  getLinkedDevices: async (): Promise<LinkedDeviceItem[]> => {
    return apiClient.get<LinkedDeviceItem[]>('/api/auth/linked-devices/');
  },

  // Revokes a single linked device session
  revokeDevice: async (deviceId: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(`/api/auth/linked-devices/${deviceId}/revoke/`);
  },

  // Revokes all active linked device sessions
  revokeAllDevices: async (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/api/auth/linked-devices/revoke-all/');
  },
};
