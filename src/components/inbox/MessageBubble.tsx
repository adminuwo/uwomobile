import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { Text } from '../Text';
import { Avatar } from '../Avatar';
import { Message } from '../../api/inbox';
import { useTheme } from '../../theme';
import { MessageSquare, AlertCircle, Check, CheckCheck, Clock, FileText, ExternalLink, Image as ImageIcon, Music, ClipboardList, Paperclip } from 'lucide-react-native';
import { resolveValidImageUri } from '../../utils/imageUri';
import * as WebBrowser from 'expo-web-browser';

interface MessageBubbleProps {
  message: Message;
  contactName?: string;
  contactAvatar?: string;
  channelColor?: string;
  onPressButton?: (buttonText: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  contactName = 'Customer',
  contactAvatar,
  channelColor,
  onPressButton,
}) => {
  const { colors } = useTheme();
  const isInternal = message.message_type === 'INTERNAL';
  const isOutgoing = message.message_type === 'OUTGOING';
  const themeColor = channelColor || colors.primary;

  const openMediaUrl = async (url?: string | null) => {
    if (!url) return;
    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        await WebBrowser.openBrowserAsync(url, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
          toolbarColor: '#0F172A',
          controlsColor: '#38BDF8',
        });
        return;
      }
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Document Link', url);
      }
    } catch (err: any) {
      try {
        await Linking.openURL(url);
      } catch {
        Alert.alert('Could not open document', err?.message || url);
      }
    }
  };

  const renderDeliveryStatus = () => {
    if (!isOutgoing) return null;

    const status = (message.status || '').toUpperCase();
    const isTemp = message.id?.startsWith('temp_');

    if (status === 'FAILED') {
      const showFailedInfo = () => {
        const meta = message.metadata || {};
        const errResp = meta.response?.error || meta.raw_error || meta.error;
        let errMsg = 'The message could not be delivered to the recipient via WhatsApp.';
        if (typeof errResp === 'string') {
          errMsg = errResp;
        } else if (errResp?.message) {
          errMsg = errResp.message;
          if (errResp.code === 100 || errResp.code === 190) {
            errMsg += '\n\nReason: WhatsApp Access Token is expired or unauthorized in Meta Business Manager. Please re-authenticate WhatsApp in Settings.';
          } else if (errResp.code === 131047) {
            errMsg += '\n\nReason: 24-hour service window closed. Meta policy requires sending an approved template to re-engage this customer.';
          } else if (errResp.code === 131026) {
            errMsg += '\n\nReason: Phone number is undeliverable or not registered on WhatsApp.';
          }
        }
        Alert.alert('Message Delivery Failed', errMsg, [{ text: 'OK' }]);
      };

      return (
        <TouchableOpacity activeOpacity={0.7} onPress={showFailedInfo} style={styles.failedBadge}>
          <AlertCircle size={10} color="#FEE2E2" />
          <Text style={styles.failedText}>Failed</Text>
        </TouchableOpacity>
      );
    }

    if (isTemp || status === 'PENDING') {
      return <Clock size={11} color="rgba(255, 255, 255, 0.65)" style={styles.statusIcon} />;
    }

    if (status === 'READ') {
      return <CheckCheck size={14} color="#38BDF8" style={styles.statusIcon} />;
    }

    if (status === 'DELIVERED' || status === 'RECEIVED') {
      return <CheckCheck size={14} color="rgba(255, 255, 255, 0.75)" style={styles.statusIcon} />;
    }

    // Default for SENT
    return <Check size={13} color="rgba(255, 255, 255, 0.75)" style={styles.statusIcon} />;
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    if (parts.length === 1) {
      return text;
    }
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <Text
            key={index}
            style={{
              textDecorationLine: 'underline',
              fontWeight: '600',
              color: isOutgoing ? '#BAE6FD' : '#0284C7',
            }}
            onPress={() => openMediaUrl(part)}
          >
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  const extractMessageButtons = (m: any): string[] => {
    if (!m) return [];
    let btnList: any[] = [];
    if (Array.isArray(m.buttons) && m.buttons.length > 0) {
      btnList = m.buttons;
    } else if (m.metadata) {
      if (Array.isArray(m.metadata.buttons) && m.metadata.buttons.length > 0) {
        btnList = m.metadata.buttons;
      } else {
        const interactiveBtns = m.metadata?.payload?.interactive?.action?.buttons;
        if (Array.isArray(interactiveBtns) && interactiveBtns.length > 0) {
          btnList = interactiveBtns;
        }
      }
    }
    return btnList
      .map((b: any) => {
        if (typeof b === 'string') return b;
        return b.reply?.title || b.title || b.text || b.label || '';
      })
      .filter(Boolean);
  };

  const msgButtons = extractMessageButtons(message);

  const mediaType = (message.media_type || '').toLowerCase();
  const rawMediaUrl = message.media_url || message.metadata?.media_url || message.metadata?.file_url;
  let mediaUrl = resolveValidImageUri(rawMediaUrl) || rawMediaUrl;

  // Extract document filename from message.media_filename or message.body (e.g. "📄 filename.pdf")
  const bodyDocMatch = (message.body || '').match(/📄\s*([^\n\r-]+(?:\.pdf|\.docx?|\.xlsx?|\.csv|\.pptx?|\.txt|\.png|\.jpe?g)?)/i);
  let docFileName = message.media_filename;
  if (!docFileName && bodyDocMatch && bodyDocMatch[1]) {
    docFileName = bodyDocMatch[1].trim();
  }
  if (!docFileName && (message.body || '').toLowerCase().includes('.pdf')) {
    for (const token of (message.body || '').split(/\s+/)) {
      if (token.toLowerCase().includes('.pdf')) {
        docFileName = token.replace(/^[📄\s'"`]+|[ '"`]+$/g, '');
        break;
      }
    }
  }

  const isDocExt = Boolean(docFileName && /\.(pdf|doc|docx|xlsx|csv|pptx|txt)/i.test(docFileName));
  const isDocument = mediaType === 'document' || Boolean(message.media_filename) || isDocExt || (mediaUrl && /\.(pdf|doc|docx|xlsx|csv|pptx|txt)/i.test(mediaUrl));

  // If this is a document and mediaUrl is missing, auto-construct proxy URL so user can view/open document!
  if (isDocument && !mediaUrl && docFileName) {
    mediaUrl = resolveValidImageUri(`/api/media-proxy/?filename=${encodeURIComponent(docFileName)}`);
  }

  const isImage = mediaType === 'image' || (mediaUrl && /\.(jpg|jpeg|png|webp|gif)/i.test(mediaUrl));
  const isAudio = mediaType === 'audio';
  const isLeadTemplate = (message.body || '').includes('[Template]') || (message.body || '').includes('[Lead Form') || (message.body || '').includes('[Instagram Lead');
  const isUnsupportedAttachment = (message.body || '').includes('[Attachment / Media]') || message.metadata?.type === 'unsupported' || message.metadata?.errors?.[0]?.code === 131051;
  const isRedundantDocBody = (isDocument || (isUnsupportedAttachment && !mediaUrl)) && (
    (message.body || '').trim() === `📄 ${docFileName}` ||
    (message.body || '').trim() === docFileName ||
    (message.body || '').trim() === `📄 ${message.media_filename}` ||
    (message.body || '').trim() === message.media_filename ||
    (message.body || '').trim() === '📎 [Attachment / Media]'
  );

  if (isInternal) {
    return (
      <View style={styles.internalContainer}>
        <View style={styles.internalHeaderRow}>
          <MessageSquare size={13} color="#D97706" />
          <Text style={styles.internalHeader}>Internal Private Note • {message.sender_name || 'Team Member'}</Text>
        </View>
        <Text style={[styles.internalBody, { color: colors.textPrimary }]}>{renderTextWithLinks(message.body)}</Text>
        <Text style={[styles.internalTime, { color: colors.textMuted }]}>{formatTime(message.created_at)}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.bubbleRow, isOutgoing ? styles.outgoingRow : styles.incomingRow]}>
      <View
        style={[
          styles.bubble,
          isOutgoing
            ? { backgroundColor: themeColor, borderBottomRightRadius: 2 }
            : { backgroundColor: colors.card, borderBottomLeftRadius: 2, borderWidth: 1, borderColor: colors.border },
        ]}
      >
        {!isOutgoing && Boolean(message.sender_name) && (
          <Text style={[styles.senderName, { color: themeColor }]}>{message.sender_name}</Text>
        )}

        {/* 1. Image Media Preview */}
        {isImage && mediaUrl ? (
          <TouchableOpacity activeOpacity={0.9} onPress={() => openMediaUrl(mediaUrl)} style={styles.imageWrapper}>
            <Image source={{ uri: mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
          </TouchableOpacity>
        ) : null}

        {/* 2. Document Card */}
        {isDocument ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openMediaUrl(mediaUrl)}
            style={[
              styles.documentCard,
              {
                backgroundColor: isOutgoing ? 'rgba(255, 255, 255, 0.16)' : colors.surface,
                borderColor: isOutgoing ? 'rgba(255, 255, 255, 0.28)' : colors.border,
              },
            ]}
          >
            <View style={[styles.docIconBox, { backgroundColor: isOutgoing ? 'rgba(255, 255, 255, 0.22)' : '#EFF6FF' }]}>
              <FileText size={20} color={isOutgoing ? '#FFFFFF' : '#2563EB'} />
            </View>
            <View style={styles.docInfo}>
              <Text numberOfLines={1} style={[styles.docTitle, { color: isOutgoing ? '#FFFFFF' : colors.textPrimary }]}>
                {docFileName || message.media_filename || 'Attachment Document'}
              </Text>
              <Text style={[styles.docSubtitle, { color: isOutgoing ? 'rgba(255, 255, 255, 0.75)' : colors.textMuted }]}>
                {(docFileName || message.media_filename || '').toLowerCase().endsWith('.pdf') || message.media_mime_type?.includes('pdf') ? 'PDF Document' : 'Document'} • Tap to open
              </Text>
            </View>
            <ExternalLink size={15} color={isOutgoing ? '#FFFFFF' : '#2563EB'} />
          </TouchableOpacity>
        ) : null}

        {/* 2.5 Unsupported / View-Once Media Card */}
        {isUnsupportedAttachment && !mediaUrl ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert(
                'Attachment Not Accessible',
                "WhatsApp Cloud API delivered this as an 'unsupported' media item (Meta Error 131051).\n\nThis occurs when the customer sends 'View Once' media, an unrecognized file extension (e.g. .zip, .apk), or an animated sticker. Meta does not supply the raw file payload to webhooks in these cases for privacy and compatibility reasons.",
                [{ text: 'Understood' }]
              );
            }}
            style={[
              styles.documentCard,
              {
                backgroundColor: isOutgoing ? 'rgba(255, 255, 255, 0.16)' : colors.surface,
                borderColor: isOutgoing ? 'rgba(255, 255, 255, 0.28)' : colors.border,
              },
            ]}
          >
            <View style={[styles.docIconBox, { backgroundColor: isOutgoing ? 'rgba(255, 255, 255, 0.22)' : '#FEF3C7' }]}>
              <Paperclip size={20} color={isOutgoing ? '#FFFFFF' : '#D97706'} />
            </View>
            <View style={styles.docInfo}>
              <Text numberOfLines={1} style={[styles.docTitle, { color: isOutgoing ? '#FFFFFF' : colors.textPrimary }]}>
                Attachment / Media
              </Text>
              <Text style={[styles.docSubtitle, { color: isOutgoing ? 'rgba(255, 255, 255, 0.75)' : colors.textMuted }]}>
                View-Once or Unsupported Format • Tap for info
              </Text>
            </View>
            <AlertCircle size={15} color={isOutgoing ? '#FFFFFF' : '#D97706'} />
          </TouchableOpacity>
        ) : null}

        {/* 3. Audio Attachment */}
        {isAudio && mediaUrl ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openMediaUrl(mediaUrl)}
            style={[
              styles.documentCard,
              {
                backgroundColor: isOutgoing ? 'rgba(255, 255, 255, 0.16)' : colors.surface,
                borderColor: isOutgoing ? 'rgba(255, 255, 255, 0.28)' : colors.border,
              },
            ]}
          >
            <View style={[styles.docIconBox, { backgroundColor: isOutgoing ? 'rgba(255, 255, 255, 0.22)' : '#ECFDF5' }]}>
              <Music size={20} color={isOutgoing ? '#FFFFFF' : '#059669'} />
            </View>
            <View style={styles.docInfo}>
              <Text numberOfLines={1} style={[styles.docTitle, { color: isOutgoing ? '#FFFFFF' : colors.textPrimary }]}>
                Voice Note / Audio
              </Text>
              <Text style={[styles.docSubtitle, { color: isOutgoing ? 'rgba(255, 255, 255, 0.75)' : colors.textMuted }]}>
                Tap to listen
              </Text>
            </View>
            <ExternalLink size={15} color={isOutgoing ? '#FFFFFF' : '#059669'} />
          </TouchableOpacity>
        ) : null}

        {/* 3.5. Instagram Lead Form Application Card */}
        {isLeadTemplate ? (
          <View
            style={[
              styles.leadFormCard,
              {
                backgroundColor: isOutgoing ? 'rgba(255, 255, 255, 0.16)' : colors.surface,
                borderColor: isOutgoing ? 'rgba(255, 255, 255, 0.28)' : '#86EFAC',
              },
            ]}
          >
            <View style={[styles.leadIconBox, { backgroundColor: isOutgoing ? 'rgba(255, 255, 255, 0.22)' : '#DCFCE7' }]}>
              <ClipboardList size={18} color={isOutgoing ? '#FFFFFF' : '#16A34A'} />
            </View>
            <View style={styles.leadInfo}>
              <Text numberOfLines={1} style={[styles.leadTitle, { color: isOutgoing ? '#FFFFFF' : colors.textPrimary }]}>
                Instagram Lead Application
              </Text>
              <Text style={[styles.leadSubtitle, { color: isOutgoing ? 'rgba(255, 255, 255, 0.75)' : colors.textMuted }]}>
                Candidate form submission verified
              </Text>
            </View>
          </View>
        ) : null}

        {/* 4. Text Body (with highlighted clickable links) */}
        {!isLeadTemplate && !isRedundantDocBody && Boolean((message.body || '').trim()) && (
          <Text style={[styles.bodyText, { color: isOutgoing ? '#FFFFFF' : colors.textPrimary }]}>
            {renderTextWithLinks((message.body || '').trim())}
          </Text>
        )}

        {/* 5. Interactive Buttons */}
        {msgButtons.length > 0 ? (
          <View style={styles.buttonList}>
            {msgButtons.map((btnText, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: isOutgoing ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isOutgoing ? 'rgba(255, 255, 255, 0.3)' : themeColor,
                  },
                ]}
                onPress={() => onPressButton && onPressButton(btnText)}
              >
                <MessageSquare size={12} color={isOutgoing ? '#FFFFFF' : themeColor} />
                <Text
                  style={[
                    styles.optionText,
                    { color: isOutgoing ? '#FFFFFF' : themeColor },
                  ]}
                >
                  {btnText}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <Text
            style={[
              styles.timeText,
              { color: isOutgoing ? 'rgba(255, 255, 255, 0.7)' : colors.textMuted },
            ]}
          >
            {formatTime(message.created_at)}
          </Text>
          {renderDeliveryStatus()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleRow: {
    marginVertical: 3,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  outgoingRow: {
    justifyContent: 'flex-end',
  },
  incomingRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 14,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 19,
  },
  imageWrapper: {
    marginBottom: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mediaImage: {
    width: 220,
    height: 160,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
    maxWidth: 240,
  },
  docIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
    gap: 2,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  docSubtitle: {
    fontSize: 10.5,
  },
  leadFormCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
    maxWidth: 240,
  },
  leadIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadInfo: {
    flex: 1,
    gap: 1.5,
  },
  leadTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  leadSubtitle: {
    fontSize: 10,
  },
  buttonList: {
    marginTop: 6,
    gap: 6,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 4,
  },
  statusIcon: {
    marginLeft: 2,
  },
  failedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.5)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  failedText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  internalContainer: {
    marginVertical: 6,
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 4,
  },
  internalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  internalHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  internalBody: {
    fontSize: 13,
    lineHeight: 18,
    color: '#1E293B',
  },
  internalTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    color: '#B45309',
  },
});
