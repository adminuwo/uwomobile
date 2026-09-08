import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { env } from '../config/env';

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

const getFullUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://')) {
    return url;
  }
  return `${env.API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

/**
 * Centralized service to download/save files directly to mobile device storage.
 * On Android: Uses StorageAccessFramework to prompt the official OS Storage Permission dialog
 * ("Allow access to folder") and writes the file directly to the user-selected public directory (Downloads/Documents).
 * On iOS / Fallback: Prompts native system save/open sheet.
 */
export async function downloadFile(options: DownloadOptions): Promise<DownloadResult> {
  const {
    filename,
    content,
    url,
    mimeType = filename.endsWith('.pdf') ? 'application/pdf' : filename.endsWith('.csv') ? 'text/csv' : 'application/octet-stream',
    dialogTitle,
  } = options;

  try {
    const resolvedUrl = getFullUrl(url);

    // Android: Request explicit folder permission (SAF) to save into public Downloads / chosen directory
    if (Platform.OS === 'android') {
      try {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (!permissions.granted) {
          return {
            success: false,
            permissionDenied: true,
            message: 'Storage permission was denied by user.',
          };
        }

        // Create file inside user's granted folder
        const safFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          filename,
          mimeType
        );

        if (content !== undefined) {
          await FileSystem.writeAsStringAsync(safFileUri, content, {
            encoding: FileSystem.EncodingType.UTF8,
          });
        } else if (resolvedUrl) {
          let sourceUri = resolvedUrl;
          if (!resolvedUrl.startsWith('file://')) {
            const tempUri = `${FileSystem.cacheDirectory}${filename}`;
            const downloadRes = await FileSystem.downloadAsync(resolvedUrl, tempUri);
            sourceUri = downloadRes.uri;
          }

          const base64Data = await FileSystem.readAsStringAsync(sourceUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await FileSystem.writeAsStringAsync(safFileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }

        console.log('[FileDownload] File saved via SAF to:', safFileUri);
        return {
          success: true,
          uri: safFileUri,
          message: `${filename} saved successfully to your selected storage folder.`,
        };
      } catch (safError: any) {
        console.warn('[FileDownload] SAF permission/save failed, trying fallback:', safError);
      }
    }

    // iOS or Fallback
    let targetUri = `${FileSystem.documentDirectory}${filename}`;
    if (content !== undefined) {
      await FileSystem.writeAsStringAsync(targetUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } else if (resolvedUrl) {
      const downloadRes = await FileSystem.downloadAsync(resolvedUrl, targetUri);
      targetUri = downloadRes.uri;
    }

    try {
      const ExpoSharing = require('expo-sharing');
      if (ExpoSharing && typeof ExpoSharing.shareAsync === 'function') {
        const isAvailable = await ExpoSharing.isAvailableAsync();
        if (isAvailable) {
          await ExpoSharing.shareAsync(targetUri, {
            mimeType,
            dialogTitle: dialogTitle || `Save ${filename}`,
          });
        }
      }
    } catch (_e) {}

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

    const resolvedUrl = getFullUrl(url);

    if (content !== undefined) {
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } else if (resolvedUrl) {
      const downloadRes = await FileSystem.downloadAsync(resolvedUrl, fileUri);
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
          : { title: dialogTitle || filename, message: `File ready at ${fileUri}\n\n${content || ''}` }
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

/**
 * Opens a local or cached file directly in the system's default viewer (PDF viewer, browser, etc.)
 */
export async function openFile(uri: string, mimeType = 'application/pdf', title = 'Open File'): Promise<boolean> {
  try {
    let localUri = uri;

    // Ensure valid file:// URI for ExpoSharing
    if (uri.startsWith('content://') && !uri.startsWith('content://com.uwo.uwoconnect')) {
      try {
        const ext = mimeType === 'application/pdf' ? 'pdf' : mimeType === 'text/csv' ? 'csv' : 'html';
        const tempPath = `${FileSystem.cacheDirectory}view_${Date.now()}.${ext}`;
        await FileSystem.copyAsync({ from: uri, to: tempPath });
        localUri = tempPath;
      } catch (_e) {
        localUri = uri;
      }
    }

    const ExpoSharing = require('expo-sharing');
    if (ExpoSharing && typeof ExpoSharing.shareAsync === 'function') {
      const isAvailable = await ExpoSharing.isAvailableAsync();
      if (isAvailable) {
        await ExpoSharing.shareAsync(localUri, {
          mimeType,
          dialogTitle: title,
          UTI: mimeType === 'text/csv' ? 'public.comma-separated-values-text' : undefined,
        });
        return true;
      }
    }
  } catch (e) {
    console.warn('[FileDownload] Error opening file with Sharing:', e);
  }

  try {
    const { Linking } = require('react-native');
    await Linking.openURL(uri);
    return true;
  } catch (e) {
    console.warn('[FileDownload] Error opening file with Linking:', e);
  }

  return false;
}



