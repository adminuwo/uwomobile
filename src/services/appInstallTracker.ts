import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { apiClient } from '../api/client';
import { secureStorage } from './secureStore';

const INSTALLATION_STORAGE_KEY = 'uwo_app_installation_id';
const LAST_TELEMETRY_PING_KEY = 'uwo_telemetry_last_ping';

export interface InstallationTelemetryData {
  installation_id: string;
  platform: 'android' | 'ios' | 'web' | 'other';
  app_version: string;
  os_version: string;
  device_model: string;
}

/**
 * Returns or generates a unique persistent installation UUID for this device.
 */
export async function getOrCreateInstallationId(): Promise<string> {
  try {
    let installId = await secureStorage.getItem(INSTALLATION_STORAGE_KEY);
    if (!installId) {
      if (Crypto && Crypto.randomUUID) {
        installId = Crypto.randomUUID();
      } else {
        installId = `inst_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      }
      await secureStorage.setItem(INSTALLATION_STORAGE_KEY, installId);
    }
    return installId;
  } catch (error) {
    console.warn('[InstallTracker] Error retrieving installation ID:', error);
    return `inst_${Date.now()}_fallback`;
  }
}

/**
 * Tracks app installation or active session engagement with the backend.
 * Called automatically upon application startup.
 */
export async function trackAppInstallation(force = false): Promise<void> {
  try {
    const installId = await getOrCreateInstallationId();

    // Check throttle to avoid repeated calls on rapid reload (ping at most once every 30 minutes unless forced)
    const lastPingStr = await secureStorage.getItem(LAST_TELEMETRY_PING_KEY);
    const now = Date.now();
    if (!force && lastPingStr) {
      const elapsed = now - parseInt(lastPingStr, 10);
      if (elapsed < 30 * 60 * 1000) {
        // Pinged recently within 30 minutes
        return;
      }
    }

    const platformName: 'android' | 'ios' | 'web' | 'other' = 
      Platform.OS === 'android' ? 'android' :
      Platform.OS === 'ios' ? 'ios' :
      Platform.OS === 'web' ? 'web' : 'other';

    const appVersion = Constants.expoConfig?.version || '1.0.0';
    const osVersion = String(Platform.Version || '');
    const deviceModel = Constants.deviceName || (
      Platform.OS === 'android' ? 'Android Device' :
      Platform.OS === 'ios' ? 'Apple Device' : 'Web Browser'
    );

    const payload: InstallationTelemetryData = {
      installation_id: installId,
      platform: platformName,
      app_version: appVersion,
      os_version: osVersion,
      device_model: deviceModel,
    };

    const res = await apiClient.post<{
      success: boolean;
      installation_id: string;
      is_first_install: boolean;
      open_count: number;
    }>('/api/telemetry/app-install/', payload);

    if (res && res.success) {
      await secureStorage.setItem(LAST_TELEMETRY_PING_KEY, String(now));
      console.log(
        `[InstallTracker] Telemetry synced: installId=${installId.slice(0, 8)}... ` +
        `first_install=${res.is_first_install} opens=${res.open_count}`
      );
    }
  } catch (error) {
    // Non-blocking, fails gracefully
    console.warn('[InstallTracker] Failed to send installation telemetry:', error);
  }
}
