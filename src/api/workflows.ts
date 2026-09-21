import { apiClient } from './client';

export interface WorkflowNode {
  id: string;
  stepNumber: number;
  type: 'TRIGGER' | 'PLAIN_MESSAGE' | 'BUTTONS' | 'IMAGE' | 'VIDEO' | 'CATALOG' | 'GOOGLE_MEET' | 'BRANCH' | 'TALK_TO_HUMAN' | 'AI_CLASSIFIER' | 'MESSAGE' | 'DELAY' | 'WEBHOOK';
  title: string;
  subtitle?: string;
  color?: string;
  detail?: string;
  configValue: string;
  buttons?: string[];
  mediaUrl?: string;
  x?: number;
  y?: number;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

export interface WorkflowItem {
  id: string;
  name: string;
  category: string;
  channel: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'MULTI';
  status: 'ACTIVE' | 'PAUSED';
  trigger: string;
  actionsCount: number;
  totalExecutions: number;
  lastRun: string;
  description: string;
  nodes: WorkflowNode[];
  edges?: WorkflowEdge[];
  raw?: any;
}

export interface WorkflowCreatePayload {
  name: string;
  category?: string;
  industry?: string;
  channels?: string[];
  steps?: any;
  trigger_type?: string;
  trigger_value?: string[];
  enabled?: boolean;
  version?: string;
}

export const workflowsApi = {
  async getWorkflows(): Promise<WorkflowItem[]> {
    try {
      const res = await apiClient.get<any>('/api/workflows/');
      const rawList: any[] = Array.isArray(res) ? res : (res?.results || []);

      return rawList.map((w: any) => {
        const channels: string[] = Array.isArray(w.channels) && w.channels.length > 0 ? w.channels : ['WHATSAPP'];
        let channel: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'MULTI' = 'WHATSAPP';
        if (channels.length > 1) {
          channel = 'MULTI';
        } else if (channels[0] === 'INSTAGRAM') {
          channel = 'INSTAGRAM';
        } else if (channels[0] === 'FACEBOOK') {
          channel = 'FACEBOOK';
        } else {
          channel = 'WHATSAPP';
        }

        let nodes: WorkflowNode[] = [];
        let edges: WorkflowEdge[] = [];
        if (w.steps?.nodes && Array.isArray(w.steps.nodes)) {
          nodes = w.steps.nodes.map((n: any, idx: number) => {
            let nodeType: WorkflowNode['type'] = 'MESSAGE';
            const t = (n.type || '').toUpperCase();
            if (t === 'TRIGGER' || t === 'START') nodeType = 'TRIGGER';
            else if (t === 'BUTTONS' || t === 'BUTTON') nodeType = 'BUTTONS';
            else if (t === 'AI_CHAT' || t === 'AI_CLASSIFIER') nodeType = 'AI_CLASSIFIER';
            else if (t === 'BRANCH' || t === 'CONDITION') nodeType = 'BRANCH';
            else if (t === 'DELAY') nodeType = 'DELAY';
            else if (t === 'WEBHOOK' || t === 'API') nodeType = 'WEBHOOK';
            else if (t === 'IMAGE') nodeType = 'IMAGE';
            else if (t === 'VIDEO') nodeType = 'VIDEO';
            else if (t === 'CATALOG') nodeType = 'CATALOG';
            else if (t === 'GOOGLE_MEET') nodeType = 'GOOGLE_MEET';
            else if (t === 'TALK_TO_HUMAN') nodeType = 'TALK_TO_HUMAN';
            else nodeType = 'MESSAGE';

            const safeMsg = typeof n.data?.message === 'string' ? n.data.message : '';
            const safeTitle = typeof n.title === 'string' ? n.title : (typeof n.data?.title === 'string' ? n.data.title : (safeMsg ? safeMsg.slice(0, 25) : `Step ${idx + 1}`));
            const safeDetail = safeMsg || (typeof n.detail === 'string' ? n.detail : (typeof n.data?.detail === 'string' ? n.data.detail : ''));
            const safeConfig = safeMsg || (typeof n.configValue === 'string' ? n.configValue : (typeof n.data?.keyword === 'string' ? n.data.keyword : ''));

            return {
              id: n.id || `node-${idx + 1}`,
              stepNumber: n.stepNumber || idx + 1,
              type: nodeType,
              title: safeTitle,
              subtitle: typeof n.subtitle === 'string' ? n.subtitle : (typeof n.data?.subtitle === 'string' ? n.data.subtitle : ''),
              color: n.color || (nodeType === 'TRIGGER' ? '#10B981' : nodeType === 'AI_CLASSIFIER' ? '#8B5CF6' : '#0284C7'),
              detail: safeDetail,
              configValue: safeConfig,
              buttons: Array.isArray(n.buttons) ? n.buttons : (Array.isArray(n.data?.buttons) ? n.data.buttons : []),
              mediaUrl: typeof n.mediaUrl === 'string' ? n.mediaUrl : (typeof n.data?.mediaUrl === 'string' ? n.data.mediaUrl : undefined),
              x: n.position?.x ?? n.x ?? 100 + (idx * 280),
              y: n.position?.y ?? n.y ?? 100,
            };
          });
          if (w.steps?.edges && Array.isArray(w.steps.edges)) {
            edges = w.steps.edges;
          }
        } else if (Array.isArray(w.steps)) {
          nodes = w.steps;
        }

      const triggerLabel = w.trigger_type === 'NEW_CHAT'
        ? 'New Customer Conversation'
        : (Array.isArray(w.trigger_value) && w.trigger_value.length > 0
          ? `Keywords: ${w.trigger_value.join(', ')}`
          : 'Inbound Message Trigger');

      return {
        id: String(w.id),
        name: w.name || 'Untitled Workflow',
        category: w.category || 'General',
        channel,
        status: w.enabled !== false ? 'ACTIVE' : 'PAUSED',
        trigger: triggerLabel,
        actionsCount: nodes.length,
        totalExecutions: w.totalExecutions || 0,
        lastRun: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : 'Never',
        description: `Automated ${w.category || 'General'} bot on ${channel}`,
        nodes,
        edges,
        raw: w,
      };
    });
    } catch (err) {
      console.error('[workflowsApi] Failed to fetch workflows:', err);
      throw err;
    }
  },

  async createWorkflow(payload: WorkflowCreatePayload): Promise<any> {
    return apiClient.post<any>('/api/workflows/', payload);
  },

  async updateWorkflow(id: string, payload: Partial<WorkflowCreatePayload>): Promise<any> {
    return apiClient.patch<any>(`/api/workflows/${id}/`, payload);
  },

  async deleteWorkflow(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/workflows/${id}/`);
  }
};
