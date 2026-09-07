import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface DownloadOptions {
  filename: string;
  content?: string;
  url?: string;
  mimeType?: string;
  dialogTitle?: string;
}

export interface DownloadResult {
  success: boolean;
  uri?: string;
  message?: string;
  permissionDenied?: boolean;
}

/**
 * Centralized service to download/save files directly to mobile device internal app storage.
 * Saves directly into FileSystem.documentDirectory without launching native activity pickers,
 * avoiding Expo Dev Client activity lifecycle crashes while ensuring robust file persistence.
 */
export async function downloadFile(options: DownloadOptions): Promise<DownloadResult> {
  const {
    filename,
    content,
    url,
  } = options;

  try {
    const targetUri = `${FileSystem.documentDirectory}${filename}`;

    if (content !== undefined) {
      await FileSystem.writeAsStringAsync(targetUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } else if (url) {
      await FileSystem.downloadAsync(url, targetUri);
    }

    console.log('[FileDownload] File saved successfully to:', targetUri);

    return {
      success: true,
      uri: targetUri,
      message: `${filename} saved successfully to device storage.`,
    };
  } catch (error: any) {
    console.error('[FileDownload] Error saving file:', error);
    return {
      success: false,
      message: error?.message || 'An error occurred while saving the file.',
    };
  }
}

/**
 * Centralized service to share files directly as file attachments (.csv, .pdf, .xlsx, etc.)
 * Safely checks for expo-sharing native module availability to avoid dev client crashes.
 */
export async function shareFile(options: DownloadOptions): Promise<DownloadResult> {
  const { filename, content, url, mimeType = 'text/csv', dialogTitle } = options;

  try {
    let fileUri = `${FileSystem.cacheDirectory}${filename}`;

    if (content !== undefined) {
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } else if (url) {
      const downloadRes = await FileSystem.downloadAsync(url, fileUri);
      fileUri = downloadRes.uri;
    }

    // Try dynamic expo-sharing first
    let expoSharingAvailable = false;
    try {
      const ExpoSharing = require('expo-sharing');
      if (ExpoSharing && typeof ExpoSharing.shareAsync === 'function') {
        const isAvailable = await ExpoSharing.isAvailableAsync();
        if (isAvailable) {
          await ExpoSharing.shareAsync(fileUri, {
            mimeType,
            dialogTitle: dialogTitle || `Share ${filename}`,
            UTI: mimeType === 'text/csv' ? 'public.comma-separated-values-text' : undefined,
          });
          expoSharingAvailable = true;
        }
      }
    } catch (_e) {
      expoSharingAvailable = false;
    }

    // Fallback to React Native Share API with file URI if ExpoSharing native module is missing
    if (!expoSharingAvailable) {
      await Share.share(
        Platform.OS === 'ios'
          ? { url: fileUri, title: dialogTitle || filename }
          : { title: dialogTitle || filename, message: `File saved to ${fileUri}\n\n${content || ''}` }
      );
    }

    return {
      success: true,
      uri: fileUri,
    };
  } catch (error: any) {
    console.error('[FileDownload] Error sharing file:', error);
    return {
      success: false,
      message: error?.message || 'An error occurred while sharing the file.',
    };
  }
}


