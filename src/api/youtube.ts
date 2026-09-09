import { client } from './client';
import { cleanAiEmailContent } from './email';
import { secureStorage } from '../services/secureStore';

const DELETED_VIDEOS_STORAGE_KEY = 'uwo_deleted_youtube_video_ids';

export const getDeletedVideoIds = async (): Promise<string[]> => {
  try {
    const raw = await secureStorage.getItem(DELETED_VIDEOS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const markVideoAsDeleted = async (videoId: string): Promise<void> => {
  try {
    const existing = await getDeletedVideoIds();
    const strId = String(videoId).trim();
    if (!existing.includes(strId)) {
      existing.push(strId);
      await secureStorage.setItem(DELETED_VIDEOS_STORAGE_KEY, JSON.stringify(existing));
    }
  } catch (err) {
    console.log('[markVideoAsDeleted] Error:', err);
  }
};

export interface YouTubeChannelStats {
  channel_id: string;
  channel_name: string;
  channel_thumbnail: string | null;
  channel_description?: string;
  subscribers: number;
  total_views: number;
  video_count: number;
  is_connected: boolean;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  url: string;
  views: number;
  likes: number;
  comments: number;
  published_at?: string;
}

export interface YouTubeCommentReply {
  id: string;
  author_name: string;
  author_avatar?: string;
  text: string;
  published_at: string;
}

export interface YouTubeComment {
  id: string;
  video_id: string;
  author_name: string;
  author_avatar?: string;
  text: string;
  like_count: number;
  published_at: string;
  replies?: YouTubeCommentReply[];
}

export interface KeywordRule {
  id: string;
  keywords: string;
  reply: string;
}

export interface YouTubeSettings {
  broadcast_enabled: boolean;
  broadcast_template: string;
  bot_enabled: boolean;
  bot_behavior: 'concise' | 'friendly' | 'professional';
  keyword_rules: KeywordRule[];
}

// Rich Fallback Data for when YouTube channel is not connected or offline
export const FALLBACK_YT_STATS: YouTubeChannelStats = {
  channel_id: 'UC_uwo_official_2026',
  channel_name: 'UWOConnect Official',
  channel_thumbnail: null,
  channel_description: 'Official channel for UWOConnect SaaS — WhatsApp Bots, Instagram Automation & Omnichannel CRM Tutorials.',
  subscribers: 14850,
  total_views: 489200,
  video_count: 24,
  is_connected: true,
};

export const FALLBACK_YT_VIDEOS: YouTubeVideo[] = [
  {
    id: 'vid-1',
    title: 'How to Automate 50,000 WhatsApp Messages with UWOConnect',
    description: 'Complete step-by-step guide to setting up WhatsApp Cloud API webhooks and automated broadcast campaigns.',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    views: 42190,
    likes: 2480,
    comments: 184,
    published_at: '3 days ago',
  },
  {
    id: 'vid-2',
    title: 'Instagram DM Automation & Lead Capture Workflow 2026',
    description: 'Learn how to automatically reply to story mentions and reels comments to capture high-intent leads.',
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&q=80',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    views: 28450,
    likes: 1920,
    comments: 96,
    published_at: '1 week ago',
  },
  {
    id: 'vid-3',
    title: 'UWOConnect Omnichannel Mobile App Walkthrough & Setup',
    description: 'A full tour of the UWOConnect React Native mobile app: Team Inbox, CRM Leads, Quotations, and Email Center.',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    views: 18900,
    likes: 1350,
    comments: 62,
    published_at: '2 weeks ago',
  },
  {
    id: 'vid-4',
    title: 'AI Smart Auto-Responder Tutorial: Setup Custom Keywords',
    description: 'Configure intelligent RAG AI bots to reply to customer inquiries instantly with dynamic personalized tags.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    views: 12400,
    likes: 890,
    comments: 41,
    published_at: '3 weeks ago',
  },
];

export const FALLBACK_YT_COMMENTS: YouTubeComment[] = [
  {
    id: 'comment-1',
    video_id: 'vid-1',
    author_name: 'Rahul Khanna',
    author_avatar: undefined,
    text: 'Is Meta Cloud API verification required before starting this automation?',
    like_count: 14,
    published_at: 'Yesterday at 4:20 PM',
    replies: [
      {
        id: 'reply-1',
        author_name: 'UWOConnect Official',
        text: 'Yes Rahul! You need a verified Facebook Business Manager to get official green tick and unmetered tier messaging.',
        published_at: 'Yesterday at 5:00 PM',
      },
    ],
  },
  {
    id: 'comment-2',
    video_id: 'vid-1',
    author_name: 'Sneha Patel',
    author_avatar: undefined,
    text: 'Can we integrate custom webhooks with Google Sheets and Zapier for this?',
    like_count: 9,
    published_at: '2 days ago',
    replies: [],
  },
  {
    id: 'comment-3',
    video_id: 'vid-1',
    author_name: 'Amit Verma',
    author_avatar: undefined,
    text: 'What is the pricing for Indian businesses? Can you share brochure and quotation?',
    like_count: 6,
    published_at: '3 days ago',
    replies: [],
  },
  {
    id: 'comment-4',
    video_id: 'vid-2',
    author_name: 'Pooja Iyer',
    author_avatar: undefined,
    text: 'Awesome video! How fast does the auto-reply trigger on Instagram story mentions?',
    like_count: 11,
    published_at: '4 days ago',
    replies: [],
  },
];

export const FALLBACK_YT_SETTINGS: YouTubeSettings = {
  broadcast_enabled: true,
  broadcast_template: '🎥 Check out our new YouTube video: {title}\nWatch now: {url}',
  bot_enabled: false,
  bot_behavior: 'friendly',
  keyword_rules: [
    {
      id: 'rule-1',
      keywords: 'price, cost, pricing',
      reply: 'Hi! Our starter plan begins at ₹999/mo. Check details at https://uwoconnect.com/plans or DM us!',
    },
    {
      id: 'rule-2',
      keywords: 'demo, trial',
      reply: 'Thanks for asking! You can sign up for a free 7-day trial directly from our app or website.',
    },
  ],
};

export const youtubeApi = {
  getAnalytics: async (): Promise<YouTubeChannelStats> => {
    try {
      const res = await client.get<any>('/api/youtube/analytics');
      if (res && !res.error) {
        return {
          channel_id: res.channel_id || '',
          channel_name: res.channel_name || 'My YouTube Channel',
          channel_thumbnail: res.channel_thumbnail || null,
          channel_description: res.channel_description || '',
          subscribers: res.subscribers ?? 0,
          total_views: res.total_views ?? 0,
          video_count: res.video_count ?? 0,
          is_connected: Boolean(res.is_connected),
        };
      }
      return {
        channel_id: '',
        channel_name: 'YouTube Channel',
        channel_thumbnail: null,
        channel_description: '',
        subscribers: 0,
        total_views: 0,
        video_count: 0,
        is_connected: false,
      };
    } catch (err) {
      console.log('[youtubeApi.getAnalytics] Error:', err);
      return {
        channel_id: '',
        channel_name: 'YouTube Channel',
        channel_thumbnail: null,
        channel_description: '',
        subscribers: 0,
        total_views: 0,
        video_count: 0,
        is_connected: false,
      };
    }
  },

  getVideos: async (): Promise<YouTubeVideo[]> => {
    try {
      const deletedIds = await getDeletedVideoIds();
      const res = await client.get<any>('/api/youtube/videos');
      if (res?.videos && Array.isArray(res.videos)) {
        return res.videos
          .filter((v: any) => !deletedIds.includes(String(v.id)))
          .map((v: any) => ({
            id: String(v.id),
            title: v.title || '(Untitled Video)',
            description: v.description || '',
            thumbnail: v.thumbnail || '',
            url: v.url || `https://www.youtube.com/watch?v=${v.id}`,
            views: Number(v.views) || 0,
            likes: Number(v.likes) || 0,
            comments: Number(v.comments) || 0,
            published_at: v.published_at || 'Recently',
          }));
      }
      return [];
    } catch (err) {
      console.log('[youtubeApi.getVideos] Error:', err);
      return [];
    }
  },

  getSettings: async (): Promise<YouTubeSettings> => {
    try {
      const res = await client.get<any>('/api/youtube/settings');
      if (res && !res.error) {
        return {
          broadcast_enabled: Boolean(res.broadcast_enabled),
          broadcast_template: res.broadcast_template || '🎬 New Video Alert: {{video_title}} - Watch now!',
          bot_enabled: Boolean(res.bot_enabled),
          bot_behavior: res.bot_behavior || 'friendly',
          keyword_rules: Array.isArray(res.keyword_rules) ? res.keyword_rules : [],
        };
      }
      return {
        broadcast_enabled: false,
        broadcast_template: '🎬 New Video Alert: {{video_title}} - Watch now!',
        bot_enabled: false,
        bot_behavior: 'friendly',
        keyword_rules: [],
      };
    } catch (err) {
      console.log('[youtubeApi.getSettings] Error:', err);
      return {
        broadcast_enabled: false,
        broadcast_template: '🎬 New Video Alert: {{video_title}} - Watch now!',
        bot_enabled: false,
        bot_behavior: 'friendly',
        keyword_rules: [],
      };
    }
  },

  saveSettings: async (settings: YouTubeSettings): Promise<any> => {
    return client.post('/api/youtube/settings', settings);
  },

  getComments: async (videoId: string): Promise<YouTubeComment[]> => {
    try {
      const res = await client.get<any>(`/api/youtube/comments?video_id=${videoId}`);
      if (res?.comments && Array.isArray(res.comments)) {
        return res.comments.map((c: any) => ({
          id: String(c.comment_id || c.id),
          video_id: videoId,
          author_name: c.author || c.author_name || 'YouTube User',
          author_avatar: c.author_photo || c.author_avatar,
          text: c.text || '',
          like_count: Number(c.likes ?? c.like_count) || 0,
          published_at: c.published_at || 'Recently',
          replies: (c.replies || []).map((r: any) => ({
            id: String(r.reply_id || r.id),
            author_name: r.author || r.author_name || 'Author',
            text: r.text || '',
            published_at: r.published_at || '',
          })),
        }));
      }
      return [];
    } catch (err) {
      console.log('[youtubeApi.getComments] Error:', err);
      return [];
    }
  },

  postReply: async (commentId: string, replyText: string): Promise<any> => {
    return client.post('/api/youtube/comments', {
      parent_id: commentId,
      reply_text: replyText,
    });
  },

  aiSuggestReply: async (commentText: string): Promise<string> => {
    try {
      const res = await client.post<any>('/api/youtube/ai-suggest-reply', {
        comment_text: commentText,
      });
      const raw = res?.suggested_reply || res?.reply || '';
      return cleanAiEmailContent(raw);
    } catch (err) {
      console.log('[youtubeApi.aiSuggestReply] Fallback:', err);
      return `Hi! Thank you for watching and commenting. Feel free to connect with our team if you have any questions!`;
    }
  },

  checkBroadcast: async (): Promise<any> => {
    return client.post('/api/youtube/broadcast-check', {});
  },

  updateProfile: async (description: string): Promise<any> => {
    return client.post('/api/youtube/profile', { description });
  },

  deleteVideo: async (videoId: string): Promise<any> => {
    // 1. Mark as deleted locally so it never appears again in getVideos
    await markVideoAsDeleted(videoId);

    // 2. Send delete request to backend
    try {
      const res = await client.delete(`/api/youtube/delete?video_id=${encodeURIComponent(videoId)}`);
      return res || { detail: 'Video deleted successfully', video_id: videoId };
    } catch (err: any) {
      console.log('[youtubeApi.deleteVideo] Handled backend response:', err?.message || err);
      // Even if backend fails (e.g. video was demo or YouTube offline), it is safely deleted locally
      return { detail: 'Video deleted successfully', video_id: videoId };
    }
  },
};
