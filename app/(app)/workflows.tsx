import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity, 
  TextInput, 
  Switch, 
  Modal, 
  ActivityIndicator,
  useWindowDimensions,
  NativeModules
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

const getScreenOrientationModule = () => {
  try {
    const hasNativeModule = (NativeModules && NativeModules.ExpoScreenOrientation) || 
      (typeof globalThis !== 'undefined' && (globalThis as any).ExpoModules?.ExpoScreenOrientation);
    if (!hasNativeModule) {
      return null;
    }
    return require('expo-screen-orientation');
  } catch (e) {
    return null;
  }
};
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { useTheme } from '../../src/theme';
import { authApi } from '../../src/api/auth';
import { statsApi } from '../../src/api/stats';
import { useSessionStore } from '../../src/stores/sessionStore';
import { 
  GitBranch, 
  Plus, 
  Play, 
  Pause, 
  Search, 
  Zap, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  ShieldCheck,
  MessageSquare,
  Clock,
  ArrowDown,
  Check,
  RotateCcw,
  Sliders,
  Database,
  Users,
  Send,
  Save,
  Trash2,
  Maximize2,
  Minimize2,
  Smartphone,
  ArrowLeft,
  MousePointer2,
  Video,
  ShoppingBag,
  Calendar,
  User,
  CheckSquare,
  Square,
  Image as ImageIcon,
  Grid,
  Lock,
  ZoomIn,
  ZoomOut
} from 'lucide-react-native';

const WhatsAppLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="24" fill="#25D366" />
    <Path
      d="M35.2 12.8C32.3 9.9 28.3 8.3 24.1 8.3C15.4 8.3 8.4 15.3 8.4 24C8.4 26.8 9.1 29.5 10.5 31.9L8.4 39.6L16.3 37.5C18.6 38.8 21.3 39.5 24.1 39.5C32.8 39.5 39.8 32.5 39.8 23.8C39.8 19.6 38.1 15.6 35.2 12.8ZM24.1 36.8C21.7 36.8 19.4 36.1 17.4 35L16.9 34.7L12.2 35.9L13.5 31.3L13.2 30.8C12 28.7 11.3 26.4 11.3 24C11.3 17 17 11.3 24.1 11.3C27.5 11.3 30.7 12.6 33.1 15C35.5 17.4 36.8 20.6 36.8 24C36.8 31 31.1 36.8 24.1 36.8Z"
      fill="#FFFFFF"
    />
  </Svg>
);

const InstagramLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Defs>
      <LinearGradient id="igGradFlow" x1="0%" y1="100%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#FFD600" />
        <Stop offset="50%" stopColor="#FF0069" />
        <Stop offset="100%" stopColor="#7638FA" />
      </LinearGradient>
    </Defs>
    <Rect width="48" height="48" rx="12" fill="url(#igGradFlow)" />
    <Rect x="11" y="11" width="26" height="26" rx="7" stroke="#FFFFFF" strokeWidth="3" fill="none" />
    <Circle cx="24" cy="24" r="6" stroke="#FFFFFF" strokeWidth="3" fill="none" />
    <Circle cx="31.5" cy="16.5" r="1.75" fill="#FFFFFF" />
  </Svg>
);

const FacebookLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="24" r="24" fill="#1877F2" />
    <Path
      d="M29.5 25.1L30.3 19.9H25.3V16.5C25.3 15.1 26 13.7 28.2 13.7H30.5V9.3C30.5 9.3 28.4 9 26.4 9C22.3 9 19.6 11.5 19.6 16V19.9H15V25.1H19.6V37.7C20.5 37.9 21.5 38 22.5 38C23.5 38 24.4 37.9 25.3 37.7V25.1H29.5Z"
      fill="#FFFFFF"
    />
  </Svg>
);

export interface WorkflowNode {
  id: string;
  stepNumber: number;
  type: 'TRIGGER' | 'PLAIN_MESSAGE' | 'BUTTONS' | 'IMAGE' | 'VIDEO' | 'CATALOG' | 'GOOGLE_MEET' | 'BRANCH' | 'TALK_TO_HUMAN' | 'AI_CLASSIFIER' | 'MESSAGE' | 'DELAY' | 'WEBHOOK';
  title: string;
  subtitle?: string;
  color: string;
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
}

export default function WorkflowsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [forceLandscapeLayout, setForceLandscapeLayout] = useState(true);
  const isLandscapeMode = (width > height) || forceLandscapeLayout;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'ACTIVE'>('ALL');
  
  // 2-Step Creation Modal state (Web Parity)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [newWorkflowTemplate, setNewWorkflowTemplate] = useState('');
  const [newWorkflowName, setNewWorkflowName] = useState('New Automation Workflow');
  const [newWorkflowCategory, setNewWorkflowCategory] = useState<'Sales' | 'Support' | 'Marketing' | 'General'>('General');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Array<'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK'>>(['WHATSAPP']);
  const [isSharedWorkflow, setIsSharedWorkflow] = useState(true);

  // Landscape Confirmation Modal State
  const [isLandscapeConfirmOpen, setIsLandscapeConfirmOpen] = useState(false);
  const [pendingWorkflowToBuild, setPendingWorkflowToBuild] = useState<WorkflowItem | null>(null);

  // Builder Modal State
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(null);
  
  // Live Test Console & Web Canvas state
  const [testInputText, setTestInputText] = useState('Hi, I want to check prices & features');
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Web Parity Canvas & Interactive Wiring States
  const [showTestSandbox, setShowTestSandbox] = useState(false);
  const [showActionsSidebar, setShowActionsSidebar] = useState(true);
  const [showWireGuideModal, setShowWireGuideModal] = useState(false);
  const [editingNode, setEditingNode] = useState<WorkflowNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [connectingSource, setConnectingSource] = useState<{ nodeId: string; handleId?: string; title: string } | null>(null);
  const [wireSuccessToast, setWireSuccessToast] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number; width: number; height: number }>>({});

  const handleNodeLayout = (nodeId: string, event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setNodePositions(prev => {
      const current = prev[nodeId];
      if (current && Math.abs(current.x - x) < 2 && Math.abs(current.y - y) < 2 && Math.abs(current.width - width) < 2 && Math.abs(current.height - height) < 2) {
        return prev;
      }
      return {
        ...prev,
        [nodeId]: { x, y, width, height }
      };
    });
  };

  const getNodeX = (node: WorkflowNode, index: number) => {
    if (node.x !== undefined) return node.x;
    if (node.id === 'h1' || node.id === 'h2') return 480;
    if (node.id === 'h3_1' || node.id.startsWith('h4_1')) return 40;
    if (node.id === 'h3_2' || node.id.startsWith('h4_2')) return 480;
    if (node.id === 'h3_3') return 920;
    if (node.id === 'h4_3a') return 700;
    if (node.id === 'h4_3b') return 920;
    if (node.id === 'h4_3c') return 1140;
    const col = index % 3;
    return 40 + col * 440;
  };

  const getNodeY = (node: WorkflowNode, index: number) => {
    if (node.y !== undefined) return node.y;
    if (node.id === 'h1') return 20;
    if (node.id === 'h2') return 130;
    if (node.id === 'h3_1' || node.id === 'h3_2' || node.id === 'h3_3') return 380;
    if (node.id === 'h4_1a' || node.id === 'h4_2a' || node.id.startsWith('h4_3')) return 620;
    if (node.id === 'h4_1b') return 770;
    if (node.id === 'h4_1c') return 920;
    if (node.id === 'h4_1d') return 1070;
    if (node.id === 'h4_2b') return 860;
    const row = Math.floor(index / 3);
    return 380 + row * 220;
  };

  const handleAddPaletteNode = (type: WorkflowNode['type'], title: string, color: string, defaultVal: string, defaultButtons?: string[]) => {
    if (!selectedWorkflow) return;
    const nextStepNum = selectedWorkflow.nodes.length + 1;
    const lastNodeIndex = selectedWorkflow.nodes.length - 1;
    const lastNode = selectedWorkflow.nodes[lastNodeIndex];

    const lastX = lastNode ? getNodeX(lastNode, lastNodeIndex) : 480;
    const lastY = lastNode ? getNodeY(lastNode, lastNodeIndex) : 20;

    const newX = lastX + 240 > 1150 ? 40 : lastX + 240;
    const newY = lastX + 240 > 1150 ? lastY + 220 : lastY;

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      stepNumber: nextStepNum,
      type,
      title: title,
      subtitle: `Step ${nextStepNum}`,
      color,
      detail: `Configured ${title}`,
      configValue: defaultVal,
      buttons: defaultButtons,
      x: newX,
      y: newY
    };

    const newEdge: WorkflowEdge | null = lastNode ? {
      id: `e_${lastNode.id}_${newNode.id}_${Date.now()}`,
      source: lastNode.id,
      target: newNode.id
    } : null;

    const updatedNodes = [...selectedWorkflow.nodes, newNode];
    const updatedEdges = newEdge ? [...(selectedWorkflow.edges || []), newEdge] : (selectedWorkflow.edges || []);

    const updatedFlow: WorkflowItem = { 
      ...selectedWorkflow, 
      nodes: updatedNodes,
      edges: updatedEdges,
      actionsCount: updatedNodes.length
    };
    setSelectedWorkflow(updatedFlow);
    setWorkflowsList(prev => prev.map(w => w.id === updatedFlow.id ? updatedFlow : w));
    setWireSuccessToast(`Added & wired "${title}" block to canvas! ✨`);
    setTimeout(() => setWireSuccessToast(null), 2500);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!selectedWorkflow) return;
    const updatedNodes = selectedWorkflow.nodes.filter(n => n.id !== nodeId);
    const updatedFlow: WorkflowItem = { 
      ...selectedWorkflow, 
      nodes: updatedNodes,
      actionsCount: updatedNodes.length
    };
    setSelectedWorkflow(updatedFlow);
    setWorkflowsList(prev => prev.map(w => w.id === updatedFlow.id ? updatedFlow : w));
  };

  const handleSaveNodeEdit = (updatedNode: WorkflowNode) => {
    if (!selectedWorkflow) return;
    const updatedNodes = selectedWorkflow.nodes.map(n => n.id === updatedNode.id ? updatedNode : n);
    const updatedFlow: WorkflowItem = { ...selectedWorkflow, nodes: updatedNodes };
    setSelectedWorkflow(updatedFlow);
    setWorkflowsList(prev => prev.map(w => w.id === updatedFlow.id ? updatedFlow : w));
    setEditingNode(null);
  };

  const handleAddButtonOption = () => {
    if (!editingNode) return;
    const currentBtns = editingNode.buttons || ['Option 1'];
    if (currentBtns.length < 3) {
      setEditingNode({
        ...editingNode,
        buttons: [...currentBtns, `Option ${currentBtns.length + 1}`]
      });
    }
  };

  const handleUpdateButtonOption = (index: number, newText: string) => {
    if (!editingNode) return;
    const currentBtns = [...(editingNode.buttons || ['Option 1'])];
    currentBtns[index] = newText;
    setEditingNode({
      ...editingNode,
      buttons: currentBtns
    });
  };

  const handleDeleteButtonOption = (index: number) => {
    if (!editingNode) return;
    const currentBtns = (editingNode.buttons || ['Option 1']).filter((_, i) => i !== index);
    setEditingNode({
      ...editingNode,
      buttons: currentBtns
    });
  };

  const handleStartWireConnection = (nodeId: string, handleId?: string, title?: string) => {
    setConnectingSource({ nodeId, handleId, title: title || 'Step' });
  };

  const handleCompleteWireConnection = (targetNodeId: string) => {
    if (!connectingSource || !selectedWorkflow) return;
    if (connectingSource.nodeId === targetNodeId) {
      setConnectingSource(null);
      return;
    }

    const newEdge: WorkflowEdge = {
      id: `e_${connectingSource.nodeId}_${targetNodeId}_${Date.now()}`,
      source: connectingSource.nodeId,
      target: targetNodeId,
      sourceHandle: connectingSource.handleId,
    };

    const currentEdges = selectedWorkflow.edges || [];
    const exists = currentEdges.some(e => e.source === newEdge.source && e.target === newEdge.target && e.sourceHandle === newEdge.sourceHandle);
    if (exists) {
      setConnectingSource(null);
      return;
    }

    const updatedEdges = [...currentEdges, newEdge];
    const updatedFlow: WorkflowItem = { ...selectedWorkflow, edges: updatedEdges };
    setSelectedWorkflow(updatedFlow);
    setWorkflowsList(prev => prev.map(w => w.id === updatedFlow.id ? updatedFlow : w));
    setConnectingSource(null);

    setWireSuccessToast('Wire connected successfully! 🔌');
    setTimeout(() => setWireSuccessToast(null), 2500);
  };

  const handleDeleteWire = (edgeId: string) => {
    if (!selectedWorkflow) return;
    const updatedEdges = (selectedWorkflow.edges || []).filter(e => e.id !== edgeId);
    const updatedFlow: WorkflowItem = { ...selectedWorkflow, edges: updatedEdges };
    setSelectedWorkflow(updatedFlow);
    setWorkflowsList(prev => prev.map(w => w.id === updatedFlow.id ? updatedFlow : w));
  };

  const lockLandscape = async () => {
    try {
      const orientationMod = getScreenOrientationModule();
      if (orientationMod && typeof orientationMod.lockAsync === 'function' && orientationMod.OrientationLock) {
        await orientationMod.lockAsync(orientationMod.OrientationLock.LANDSCAPE);
      }
    } catch (e) {
      console.log('Screen orientation lock landscape error:', e);
    }
  };

  const lockPortrait = async () => {
    try {
      const orientationMod = getScreenOrientationModule();
      if (orientationMod && typeof orientationMod.lockAsync === 'function' && orientationMod.OrientationLock) {
        await orientationMod.lockAsync(orientationMod.OrientationLock.PORTRAIT_UP);
      }
    } catch (e) {
      console.log('Screen orientation lock portrait error:', e);
    }
  };

  // Automatically lock screen to LANDSCAPE when builder opens, and PORTRAIT when closed
  useEffect(() => {
    if (isBuilderModalOpen) {
      lockLandscape();
    } else {
      lockPortrait();
    }
    return () => {
      lockPortrait();
    };
  }, [isBuilderModalOpen]);

  const [workflowsList, setWorkflowsList] = useState<WorkflowItem[]>([
    {
      id: 'flow-1',
      name: 'ABC Hospital Lead Router',
      category: 'Sales',
      channel: 'WHATSAPP',
      status: 'ACTIVE',
      trigger: 'Keyword: HOSPITAL',
      actionsCount: 14,
      totalExecutions: 4820,
      lastRun: '1 min ago',
      description: 'Multi-branch Interactive WhatsApp Lead Router for Hospital Appointments & Packages',
      nodes: [
        {
          id: 'h1',
          stepNumber: 1,
          type: 'TRIGGER',
          title: 'START FLOW',
          subtitle: 'Channel: Meta WhatsApp Business API',
          color: '#059669',
          detail: 'Triggers when user messages "HOSPITAL"',
          configValue: 'HOSPITAL',
          x: 480,
          y: 20
        },
        {
          id: 'h2',
          stepNumber: 2,
          type: 'BUTTONS',
          title: 'BUTTONS',
          subtitle: 'Welcome Menu with Quick Action Options',
          color: '#6366F1',
          detail: '3 Interactive Options',
          configValue: 'Hello 🏥 Welcome to ABC Multispeciality Hospital 🏥 We are here to assist you.',
          buttons: ['BOOK APPOINTMENT', 'HEALTH PACKAGES', 'EMERGENCY & SUPPORT'],
          x: 480,
          y: 130
        },
        {
          id: 'h3_1',
          stepNumber: 3,
          type: 'BUTTONS',
          title: 'BUTTONS',
          subtitle: 'Department Selection',
          color: '#6366F1',
          detail: 'Select Specialist Department',
          configValue: 'Please select the department you wish to visit:',
          buttons: ['GENERAL PHYSICIAN', 'CARDIOLOGY', 'ORTHOPEDICS'],
          x: 40,
          y: 380
        },
        {
          id: 'h4_1a',
          stepNumber: 4,
          type: 'MESSAGE',
          title: 'MESSAGE',
          subtitle: 'Capture Patient Name',
          color: '#059669',
          detail: 'Name prompt',
          configValue: 'Please enter Patient Name.',
          x: 40,
          y: 620
        },
        {
          id: 'h4_1b',
          stepNumber: 5,
          type: 'MESSAGE',
          title: 'MESSAGE',
          subtitle: 'Capture Patient Age',
          color: '#059669',
          detail: 'Age prompt',
          configValue: 'Please enter Patient Age.',
          x: 40,
          y: 770
        },
        {
          id: 'h4_1c',
          stepNumber: 6,
          type: 'MESSAGE',
          title: 'MESSAGE',
          subtitle: 'Appointment Date',
          color: '#059669',
          detail: 'Date prompt',
          configValue: 'Please share your preferred appointment date.',
          x: 40,
          y: 920
        },
        {
          id: 'h4_1d',
          stepNumber: 7,
          type: 'MESSAGE',
          title: 'MESSAGE',
          subtitle: 'Appointment Summary',
          color: '#059669',
          detail: 'Confirmation message',
          configValue: 'Thank you for sharing the details. 🏥 Appointment Summary Patient Name: {Name} Age: {Age} Department:...',
          x: 40,
          y: 1070
        },
        {
          id: 'h3_2',
          stepNumber: 8,
          type: 'BUTTONS',
          title: 'BUTTONS',
          subtitle: 'Health Package Selection',
          color: '#6366F1',
          detail: 'Package list',
          configValue: 'Choose a package that suits your needs:',
          buttons: ['BASIC CHECKUP', 'HEART HEALTH', 'FAMILY PACKAGE'],
          x: 480,
          y: 380
        },
        {
          id: 'h4_2a',
          stepNumber: 9,
          type: 'BUTTONS',
          title: 'BUTTONS',
          subtitle: 'Heart Package Details',
          color: '#6366F1',
          detail: 'Package details & confirm',
          configValue: '❣️ Heart Health Package ✓ ECG ✓ Blood Pressure Screening ✓ Cholesterol Test ...',
          buttons: ['YES', 'CALL ME LATER', 'MAIN MENU'],
          x: 480,
          y: 620
        },
        {
          id: 'h4_2b',
          stepNumber: 10,
          type: 'MESSAGE',
          title: 'MESSAGE',
          subtitle: 'Advisor Confirmation',
          color: '#059669',
          detail: 'Advisor callback info',
          configValue: 'Thank you. Our healthcare advisor will contact you shortly and guide you further.',
          x: 480,
          y: 860
        },
        {
          id: 'h3_3',
          stepNumber: 11,
          type: 'BUTTONS',
          title: 'BUTTONS',
          subtitle: 'Support Options',
          color: '#6366F1',
          detail: 'Support & Location',
          configValue: 'How can we help you?',
          buttons: ['EMERGENCY', 'LOCATION', 'TALK TO SUPPORT'],
          x: 920,
          y: 380
        },
        {
          id: 'h4_3a',
          stepNumber: 12,
          type: 'MESSAGE',
          title: 'MESSAGE',
          subtitle: 'Emergency Call',
          color: '#059669',
          detail: 'Helpline details',
          configValue: '🚨 Emergency Helpline Call: +91 XXXXX XXXXX Our emergency team is available 24x7.',
          x: 700,
          y: 620
        },
        {
          id: 'h4_3b',
          stepNumber: 13,
          type: 'MESSAGE',
          title: 'MESSAGE',
          subtitle: 'Hospital Location',
          color: '#059669',
          detail: 'Maps & location link',
          configValue: '📍 ABC Multispeciality Hospital Main Road, City Center 📍 Google Maps Location: (Location Link) We look...',
          x: 920,
          y: 620
        },
        {
          id: 'h4_3c',
          stepNumber: 14,
          type: 'MESSAGE',
          title: 'MESSAGE',
          subtitle: 'Live Support',
          color: '#059669',
          detail: 'Executive contact',
          configValue: '📞 👨‍💼 Please briefly describe your concern. Our patient care executive will contact you shortly.',
          x: 1140,
          y: 620
        }
      ],
      edges: [
        { id: 'e1', source: 'h1', target: 'h2' },
        { id: 'e2', source: 'h2', sourceHandle: 'btn-0', target: 'h3_1' },
        { id: 'e3', source: 'h2', sourceHandle: 'btn-1', target: 'h3_2' },
        { id: 'e4', source: 'h2', sourceHandle: 'btn-2', target: 'h3_3' },
        { id: 'e5', source: 'h3_1', target: 'h4_1a' },
        { id: 'e6', source: 'h4_1a', target: 'h4_1b' },
        { id: 'e7', source: 'h4_1b', target: 'h4_1c' },
        { id: 'e8', source: 'h4_1c', target: 'h4_1d' },
        { id: 'e9', source: 'h3_2', target: 'h4_2a' },
        { id: 'e10', source: 'h4_2a', target: 'h4_2b' },
        { id: 'e11', source: 'h3_3', sourceHandle: 'btn-0', target: 'h4_3a' },
        { id: 'e12', source: 'h3_3', sourceHandle: 'btn-1', target: 'h4_3b' },
        { id: 'e13', source: 'h3_3', sourceHandle: 'btn-2', target: 'h4_3c' },
      ]
    },
    {
      id: 'flow-2',
      name: 'Instagram Story Bot',
      category: 'Marketing',
      channel: 'INSTAGRAM',
      status: 'ACTIVE',
      trigger: 'Trigger: Story Tag / Mention / DM',
      actionsCount: 4,
      totalExecutions: 890,
      lastRun: '14 mins ago',
      description: 'Instant AI DM response to Instagram Story tags with catalog link',
      nodes: [
        {
          id: 'n2-1',
          stepNumber: 1,
          type: 'TRIGGER',
          title: 'Instagram Story Tag or Direct Message',
          subtitle: 'Channel: Instagram Graph API Webhook',
          color: '#EC4899',
          detail: 'Triggers on @mention in Story or IG Direct Message',
          configValue: 'Trigger on any Story Tag or IG DM',
        },
        {
          id: 'n2-2',
          stepNumber: 2,
          type: 'AI_CLASSIFIER',
          title: 'AI Sentiment & Media Extractor',
          subtitle: 'Gemini Vision AI Engine',
          color: '#8B5CF6',
          detail: 'Analyzes story text & user bio for VIP customer badge',
          configValue: 'Analyze bio & story text for brand keywords',
        },
        {
          id: 'n2-3',
          stepNumber: 3,
          type: 'MESSAGE',
          title: 'Instant IG Private DM Reply',
          subtitle: 'Interactive Messenger Card with Promo Code',
          color: '#0284C7',
          detail: 'Message: "Thanks for tagging us! Use code INSTA10 for 10% off!"',
          configValue: 'Thanks for tagging us! Here is your exclusive discount code: INSTA10',
        },
        {
          id: 'n2-4',
          stepNumber: 4,
          type: 'WEBHOOK',
          title: 'CRM Contact Sync & Lead Tagging',
          subtitle: 'Syncs handle to UwoConnect CRM',
          color: '#10B981',
          detail: 'Adds tag: "IG-Story-Advocate" to lead profile',
          configValue: 'Sync to UwoConnect Lead Database',
        },
      ]
    },
    {
      id: 'flow-3',
      name: 'Facebook Lead Responder',
      category: 'Lead Gen',
      channel: 'FACEBOOK',
      status: 'ACTIVE',
      trigger: 'Trigger: Facebook Lead Form',
      actionsCount: 4,
      totalExecutions: 560,
      lastRun: '1 hour ago',
      description: 'Captures Lead Form details & triggers instant WhatsApp welcome message',
      nodes: [
        {
          id: 'n3-1',
          stepNumber: 1,
          type: 'TRIGGER',
          title: 'Meta Facebook Lead Form Submitted',
          subtitle: 'Channel: Meta Ads Instant Forms',
          color: '#1877F2',
          detail: 'Captures Name, Phone, Email & Inquiry interest',
          configValue: 'FormID: Meta_Lead_Form_Active',
        },
        {
          id: 'n3-2',
          stepNumber: 2,
          type: 'WEBHOOK',
          title: 'Instant CRM Contact Creation',
          subtitle: 'UwoConnect Multi-Channel CRM',
          color: '#10B981',
          detail: 'Creates lead record & assigns to active sales pipeline',
          configValue: 'Pipeline Stage: New Inbound Lead',
        },
        {
          id: 'n3-3',
          stepNumber: 3,
          type: 'MESSAGE',
          title: 'Outbound WhatsApp Template Message',
          subtitle: 'Approved Meta Business Template',
          color: '#0284C7',
          detail: 'Template: welcome_lead_intro (Variables: {{1}})',
          configValue: 'Hi {{name}}, thanks for requesting details on Meta! How can we assist you?',
        },
        {
          id: 'n3-4',
          stepNumber: 4,
          type: 'DELAY',
          title: 'Agent Assignment Notification',
          subtitle: 'Mobile Push & Email Alert',
          color: '#F59E0B',
          detail: 'Notifies on-duty sales rep if customer replies',
          configValue: 'Push alert to assigned agent',
        },
      ]
    },
    {
      id: 'flow-4',
      name: 'WhatsApp Banking Bot',
      category: 'Support',
      channel: 'WHATSAPP',
      status: 'PAUSED',
      trigger: 'Keywords: order, balance, status',
      actionsCount: 5,
      totalExecutions: 3100,
      lastRun: 'Yesterday',
      description: '24/7 automated order status lookup & RAG Knowledge Base answers',
      nodes: [
        {
          id: 'n4-1',
          stepNumber: 1,
          type: 'TRIGGER',
          title: 'Customer Banking / Order Inquiry',
          subtitle: 'Channel: WhatsApp Business API',
          color: '#10B981',
          detail: 'Keywords: order, balance, invoice, status, track',
          configValue: 'order, balance, invoice, status, track',
        },
        {
          id: 'n4-2',
          stepNumber: 2,
          type: 'AI_CLASSIFIER',
          title: 'Secure OTP & Identity Verification',
          subtitle: '2FA Auth Engine',
          color: '#8B5CF6',
          detail: 'Verifies customer registered phone number with database',
          configValue: 'Verify customer auth phone',
        },
        {
          id: 'n4-3',
          stepNumber: 3,
          type: 'WEBHOOK',
          title: 'Live Backend Django API Data Fetch',
          subtitle: 'REST API Ingestion',
          color: '#F59E0B',
          detail: 'Fetches latest order status, tracking URL & balance',
          configValue: 'GET /api/orders/lookup?phone={{sender}}',
        },
        {
          id: 'n4-4',
          stepNumber: 4,
          type: 'MESSAGE',
          title: 'Dynamic Data Response Message',
          subtitle: 'Formatted Text + Quick Link',
          color: '#0284C7',
          detail: 'Message: "Your Order #{{order_id}} is OUT FOR DELIVERY via BlueDart!"',
          configValue: 'Your Order #{{order_id}} status: {{order_status}}. Track here: {{tracking_url}}',
        },
        {
          id: 'n4-5',
          stepNumber: 5,
          type: 'MESSAGE',
          title: 'CSAT Rating & Feedback Survey',
          subtitle: 'Interactive Rating Buttons',
          color: '#EC4899',
          detail: 'Buttons: [ ⭐⭐⭐⭐⭐ Excellent ] [ 💬 Agent Support ]',
          configValue: 'Rate your conversation experience today:',
        },
      ]
    },
  ]);

  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authApi.getProfile(),
  });

  const { data: clientStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['clientStats'],
    queryFn: () => statsApi.getClientStats(),
  });

  const onRefresh = () => {
    refetchProfile();
    refetchStats();
  };

  const toggleWorkflowStatus = (id: string) => {
    setWorkflowsList(prev =>
      prev.map(w => {
        if (w.id === id) {
          const nextStatus: 'ACTIVE' | 'PAUSED' = w.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          const updated: WorkflowItem = { ...w, status: nextStatus };
          if (selectedWorkflow?.id === id) {
            setSelectedWorkflow(updated);
          }
          return updated;
        }
        return w;
      })
    );
  };

  const requestOpenBuilderInLandscape = (flow: WorkflowItem) => {
    setPendingWorkflowToBuild(flow);
    setIsLandscapeConfirmOpen(true);
  };

  const closeWorkflowBuilder = async () => {
    setIsBuilderModalOpen(false);
    await lockPortrait();
  };

  const togglePlatformSelection = (platform: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK') => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        if (prev.length === 1) return prev;
        return prev.filter(p => p !== platform);
      }
      return [...prev, platform];
    });
  };

  const handleStartBuildingWorkflow = () => {
    setIsCreateModalOpen(false);

    const primaryChannel: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'MULTI' = 
      selectedPlatforms.length > 1 ? 'MULTI' : (selectedPlatforms[0] || 'WHATSAPP');

    const newFlow: WorkflowItem = {
      id: `flow-${Date.now()}`,
      name: newWorkflowName.trim() || 'New Automation Workflow',
      category: newWorkflowCategory,
      channel: primaryChannel,
      status: 'ACTIVE',
      trigger: `Trigger: ${selectedPlatforms.join(', ')} Inbound`,
      actionsCount: 4,
      totalExecutions: 0,
      lastRun: 'Just now',
      description: `Automated ${newWorkflowCategory} flow running across ${selectedPlatforms.join(', ')}`,
      nodes: [
        {
          id: `n-${Date.now()}-1`,
          stepNumber: 1,
          type: 'TRIGGER',
          title: `Inbound Message Trigger (${selectedPlatforms.join(', ')})`,
          subtitle: `Platforms: ${selectedPlatforms.join(', ')}`,
          color: '#10B981',
          detail: 'Triggers on incoming customer messages or keyword match',
          configValue: 'hello, price, info, demo, inquiry',
        },
        {
          id: `n-${Date.now()}-2`,
          stepNumber: 2,
          type: 'AI_CLASSIFIER',
          title: 'Gemini 1.5 RAG Intent Classifier',
          subtitle: 'Knowledge Base: Product Specs & FAQs',
          color: '#8B5CF6',
          detail: 'Classifies intent & extracts lead parameters',
          configValue: `System Prompt: Analyze intent for ${selectedPlatforms.join(', ')} leads`,
        },
        {
          id: `n-${Date.now()}-3`,
          stepNumber: 3,
          type: 'MESSAGE',
          title: 'Automated Response Message',
          subtitle: 'Interactive Buttons & Media Attachment',
          color: '#0284C7',
          detail: 'Sends instant reply to customer',
          configValue: `Hello {{contact_name}}, welcome to {{brand_name}}! How can we assist you today on ${selectedPlatforms[0]}?`,
        },
        {
          id: `n-${Date.now()}-4`,
          stepNumber: 4,
          type: 'DELAY',
          title: 'Follow-Up Delay Step',
          subtitle: 'Automated Re-engagement',
          color: '#EC4899',
          detail: 'Wait 15 minutes for reply',
          configValue: '15 Minutes',
        },
      ]
    };

    setWorkflowsList(prev => [newFlow, ...prev]);
    requestOpenBuilderInLandscape(newFlow);
  };

  const handleUpdateNodeConfig = (nodeId: string, newConfigValue: string) => {
    if (!selectedWorkflow) return;
    const updatedNodes = selectedWorkflow.nodes.map(n => 
      n.id === nodeId ? { ...n, configValue: newConfigValue, detail: `Configured: ${newConfigValue}` } : n
    );
    const updatedFlow: WorkflowItem = { ...selectedWorkflow, nodes: updatedNodes };
    setSelectedWorkflow(updatedFlow);
    setWorkflowsList(prev => prev.map(w => w.id === updatedFlow.id ? updatedFlow : w));
  };

  const handleAddNewNode = () => {
    if (!selectedWorkflow) return;
    const nextStepNum = selectedWorkflow.nodes.length + 1;
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      stepNumber: nextStepNum,
      type: 'MESSAGE',
      title: `Step ${nextStepNum}: Custom Automated Action`,
      subtitle: 'Configured Workflow Node',
      color: '#0284C7',
      detail: 'Custom message / action step added to flow',
      configValue: 'Thank you for connecting with us! Our team will get back to you shortly.',
    };

    const updatedNodes = [...selectedWorkflow.nodes, newNode];
    const updatedFlow: WorkflowItem = { 
      ...selectedWorkflow, 
      nodes: updatedNodes,
      actionsCount: updatedNodes.length
    };
    setSelectedWorkflow(updatedFlow);
    setWorkflowsList(prev => prev.map(w => w.id === updatedFlow.id ? updatedFlow : w));
  };

  const handleRunLiveTest = () => {
    if (!selectedWorkflow) return;
    setIsTesting(true);
    setTestLogs([]);

    const inputMsg = testInputText.trim() || 'Hello, send pricing details';

    setTimeout(() => {
      setTestLogs(prev => [...prev, `[12:56:01] ⚡ Webhook Received: "${inputMsg}"`]);
    }, 400);

    setTimeout(() => {
      setTestLogs(prev => [...prev, `[12:56:02] ✨ Gemini 1.5 RAG Engine: Intent classified as "Product Inquiry" (99.2% accuracy)`]);
    }, 900);

    setTimeout(() => {
      setTestLogs(prev => [...prev, `[12:56:03] 🔀 Branching Rule: Lead Score 85 → Routed to High-Intent Sales Path`]);
    }, 1400);

    setTimeout(() => {
      setTestLogs(prev => [...prev, `[12:56:04] 💬 Automated response sent successfully across selected platform!`]);
      setIsTesting(false);
    }, 1900);
  };

  const handleSaveWorkflow = () => {
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 2000);
  };

  const filteredWorkflows = workflowsList.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          w.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'WHATSAPP') return w.channel === 'WHATSAPP';
    if (activeTab === 'INSTAGRAM') return w.channel === 'INSTAGRAM';
    if (activeTab === 'FACEBOOK') return w.channel === 'FACEBOOK';
    if (activeTab === 'ACTIVE') return w.status === 'ACTIVE';
    return true;
  });

  const activeFlowsCount = workflowsList.filter(w => w.status === 'ACTIVE').length;
  const totalExecutions = workflowsList.reduce((acc, curr) => acc + curr.totalExecutions, 0);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WHATSAPP':
        return <WhatsAppLogo size={22} />;
      case 'INSTAGRAM':
        return <InstagramLogo size={22} />;
      case 'FACEBOOK':
        return <FacebookLogo size={22} />;
      default:
        return <GitBranch size={20} color={colors.primary} />;
    }
  };

  const getNodeIcon = (type: string, color: string) => {
    switch (type) {
      case 'TRIGGER':
        return <Zap size={18} color={color} />;
      case 'AI_CLASSIFIER':
        return <Sparkles size={18} color={color} />;
      case 'BRANCH':
        return <GitBranch size={18} color={color} />;
      case 'MESSAGE':
        return <MessageSquare size={18} color={color} />;
      case 'DELAY':
        return <Clock size={18} color={color} />;
      case 'WEBHOOK':
        return <Database size={18} color={color} />;
      default:
        return <Sliders size={18} color={color} />;
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header 
        title="Workflows" 
        showBack 
        onBackPress={() => router.back()} 
        rightElement={
          <TouchableOpacity 
            style={[styles.addFlowBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setIsCreateModalOpen(true);
              setCreateStep(1);
              setNewWorkflowTemplate('');
              setNewWorkflowName('New Automation Workflow');
              setSelectedPlatforms(['WHATSAPP']);
            }}
          >
            <Plus size={18} color="#FFF" />
            <Text variant="caption" weight="bold" color="#FFF">
              New Flow
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={profileLoading || statsLoading} onRefresh={onRefresh} />
        }
      >
        {/* Workflows Overview Header Card */}
        <Card variant="default" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryTextGroup}>
              <Text variant="h2" weight="bold" color={colors.textPrimary}>
                {activeFlowsCount} Active Workflows
              </Text>
              <Text variant="caption" color={colors.textMuted} style={styles.summarySubtitle}>
                {totalExecutions.toLocaleString()} total automated AI executions
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: colors.success + '18' }]}>
              <Zap size={16} color={colors.success} />
              <Text variant="caption" weight="bold" color={colors.success}>
                Engine Live
              </Text>
            </View>
          </View>
        </Card>

        {/* Search Bar */}
        <View style={[styles.searchWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search workflows, triggers & nodes..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Channel & Status Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { id: 'ALL', label: 'All Flows', count: workflowsList.length },
            { id: 'ACTIVE', label: 'Active', count: activeFlowsCount },
            { id: 'WHATSAPP', label: 'WhatsApp', count: workflowsList.filter(w => w.channel === 'WHATSAPP').length },
            { id: 'INSTAGRAM', label: 'Instagram', count: workflowsList.filter(w => w.channel === 'INSTAGRAM').length },
            { id: 'FACEBOOK', label: 'Facebook', count: workflowsList.filter(w => w.channel === 'FACEBOOK').length },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Text
                  variant="caption"
                  weight="bold"
                  color={isActive ? colors.textInverse : colors.textPrimary}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Workflows List */}
        <Text variant="label" style={styles.sectionLabel}>
          AUTOMATION FLOWS ({filteredWorkflows.length})
        </Text>

        {filteredWorkflows.length > 0 ? (
          filteredWorkflows.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => requestOpenBuilderInLandscape(item)}
            >
              <Card style={styles.workflowCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconTitleRow}>
                    <View style={styles.channelIconBox}>
                      {getChannelIcon(item.channel)}
                    </View>
                    <View style={styles.titleBox}>
                      <Text variant="body" weight="bold" color={colors.textPrimary} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text variant="caption" color={colors.textMuted}>
                        {item.category} • {item.nodes?.length || item.actionsCount} Nodes
                      </Text>
                    </View>
                  </View>

                  {/* Status Switch Toggle */}
                  <View style={styles.switchWrapper}>
                    <Switch
                      value={item.status === 'ACTIVE'}
                      onValueChange={() => toggleWorkflowStatus(item.id)}
                      trackColor={{ false: colors.border, true: colors.success + '80' }}
                      thumbColor={item.status === 'ACTIVE' ? colors.success : colors.textMuted}
                    />
                  </View>
                </View>

                {/* Compact Trigger Info Box */}
                <View style={[styles.triggerBox, { backgroundColor: colors.background }]}>
                  <Zap size={14} color={colors.warning} />
                  <Text variant="caption" weight="medium" color={colors.textPrimary} numberOfLines={1} style={{ flex: 1 }}>
                    {item.trigger}
                  </Text>
                </View>

                {/* Footer Execution Stats */}
                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <View style={styles.statsCol}>
                    <Text variant="caption" color={colors.textMuted}>
                      Executions: <Text variant="caption" weight="bold" color={colors.primary}>{item.totalExecutions.toLocaleString()}</Text>
                    </Text>
                  </View>

                  <View style={styles.openBuilderBtn}>
                    <Text variant="caption" weight="bold" color={colors.primary}>
                      View Builder
                    </Text>
                    <ChevronRight size={16} color={colors.primary} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text variant="caption" color={colors.textMuted}>
              No workflows found for this filter tab.
            </Text>
          </Card>
        )}

        {/* Security Vault Banner */}
        <Card variant="outlined" style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <ShieldCheck size={18} color={colors.primary} />
            <Text variant="label" weight="bold" color={colors.primary}>
              Real-Time AI Execution Engine
            </Text>
          </View>
          <Text variant="caption" color={colors.textMuted}>
            All active workflows are executed asynchronously with sub-second response latency across Meta Cloud APIs.
          </Text>
        </Card>
      </ScrollView>

      {/* ========================================================================= */}
      {/* 2-STEP WORKFLOW CREATION & PLATFORM SELECTION MODAL (WEB PARITY) */}
      {/* ========================================================================= */}
      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text variant="h2" weight="bold" color={colors.textPrimary}>
                  {createStep === 1 ? 'Create New Workflow' : 'Select Target Platform'}
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  {createStep === 1 ? 'Step 1 of 2: Choose Template or Scratch' : 'Step 2 of 2: Select Instagram, Facebook or WhatsApp'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {createStep === 1 ? (
              /* STEP 1: TEMPLATE SELECTION OR SCRATCH */
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
                {/* Create from Scratch Prominent Button */}
                <TouchableOpacity
                  style={[styles.scratchBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setNewWorkflowTemplate('Custom Blank Flow');
                    setNewWorkflowName('Custom Blank Workflow');
                    setCreateStep(2);
                  }}
                >
                  <Plus size={18} color="#FFF" />
                  <Text variant="body" weight="bold" color="#FFF">
                    + Create Workflow from Scratch
                  </Text>
                </TouchableOpacity>

                <Text variant="label" style={{ marginTop: 14, marginBottom: 10 }}>
                  OR CHOOSE PRE-BUILT TEMPLATE:
                </Text>

                {[
                  { name: 'Hospital & Healthcare Appointment Bot', category: 'Healthcare', desc: 'Auto-book doctor slots & send reminder alerts' },
                  { name: 'Real Estate Site Visit & Brochure Bot', category: 'Real Estate', desc: 'Capture property leads & send brochure PDF' },
                  { name: 'School & College Admission Helpdesk', category: 'Education', desc: 'Interactive admission fee structure & FAQs' },
                  { name: 'E-Commerce Product Catalog & Recovery', category: 'E-Commerce', desc: 'Abandoned cart checkout recovery flow' },
                  { name: 'WhatsApp Banking & Balance Lookup', category: 'Banking', desc: 'Secure customer account balance check' },
                ].map((tpl, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.templateItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => {
                      setNewWorkflowTemplate(tpl.name);
                      setNewWorkflowName(tpl.name);
                      setNewWorkflowCategory(
                        tpl.category === 'Healthcare' || tpl.category === 'Education' ? 'Support' :
                        tpl.category === 'Real Estate' || tpl.category === 'E-Commerce' ? 'Sales' : 'General'
                      );
                      setCreateStep(2);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text variant="body" weight="bold" color={colors.textPrimary}>
                        {tpl.name}
                      </Text>
                      <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                        {tpl.desc}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              /* STEP 2: PLATFORM SELECTION & WORKFLOW CONFIG */
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
                {/* Selected Template Badge */}
                {newWorkflowTemplate && (
                  <View style={[styles.selectedTemplateBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ flex: 1 }} numberOfLines={1}>
                      Template: {newWorkflowTemplate}
                    </Text>
                    <TouchableOpacity onPress={() => setCreateStep(1)}>
                      <Text variant="caption" weight="bold" color={colors.primary}>
                        Change
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 3 LARGE PLATFORM SELECTION CARDS */}
                <Text variant="label" style={{ marginBottom: 10 }}>
                  1. SELECT TARGET PLATFORM(S):
                </Text>
                
                <View style={styles.platformGrid}>
                  {/* WhatsApp Card */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.platformCard,
                      {
                        backgroundColor: selectedPlatforms.includes('WHATSAPP') ? '#25D36615' : colors.background,
                        borderColor: selectedPlatforms.includes('WHATSAPP') ? '#25D366' : colors.border,
                        borderWidth: selectedPlatforms.includes('WHATSAPP') ? 2 : 1,
                      }
                    ]}
                    onPress={() => togglePlatformSelection('WHATSAPP')}
                  >
                    <WhatsAppLogo size={32} />
                    <Text variant="body" weight="bold" color={colors.textPrimary} style={{ marginTop: 8 }}>
                      WhatsApp
                    </Text>
                    <Text variant="caption" color={colors.textMuted}>
                      Cloud API
                    </Text>
                    {selectedPlatforms.includes('WHATSAPP') && (
                      <View style={[styles.checkCircle, { backgroundColor: '#25D366' }]}>
                        <Check size={12} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Instagram Card */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.platformCard,
                      {
                        backgroundColor: selectedPlatforms.includes('INSTAGRAM') ? '#E1306C15' : colors.background,
                        borderColor: selectedPlatforms.includes('INSTAGRAM') ? '#E1306C' : colors.border,
                        borderWidth: selectedPlatforms.includes('INSTAGRAM') ? 2 : 1,
                      }
                    ]}
                    onPress={() => togglePlatformSelection('INSTAGRAM')}
                  >
                    <InstagramLogo size={32} />
                    <Text variant="body" weight="bold" color={colors.textPrimary} style={{ marginTop: 8 }}>
                      Instagram
                    </Text>
                    <Text variant="caption" color={colors.textMuted}>
                      Direct / DM
                    </Text>
                    {selectedPlatforms.includes('INSTAGRAM') && (
                      <View style={[styles.checkCircle, { backgroundColor: '#E1306C' }]}>
                        <Check size={12} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Facebook Card */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.platformCard,
                      {
                        backgroundColor: selectedPlatforms.includes('FACEBOOK') ? '#1877F215' : colors.background,
                        borderColor: selectedPlatforms.includes('FACEBOOK') ? '#1877F2' : colors.border,
                        borderWidth: selectedPlatforms.includes('FACEBOOK') ? 2 : 1,
                      }
                    ]}
                    onPress={() => togglePlatformSelection('FACEBOOK')}
                  >
                    <FacebookLogo size={32} />
                    <Text variant="body" weight="bold" color={colors.textPrimary} style={{ marginTop: 8 }}>
                      Facebook
                    </Text>
                    <Text variant="caption" color={colors.textMuted}>
                      Lead Ads
                    </Text>
                    {selectedPlatforms.includes('FACEBOOK') && (
                      <View style={[styles.checkCircle, { backgroundColor: '#1877F2' }]}>
                        <Check size={12} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Workflow Name Input */}
                <Text variant="label" style={{ marginTop: 14, marginBottom: 6 }}>
                  2. WORKFLOW NAME:
                </Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                  value={newWorkflowName}
                  onChangeText={setNewWorkflowName}
                  placeholder="e.g. Lead Qualification Flow"
                  placeholderTextColor={colors.textMuted}
                />

                {/* Workflow Category Options */}
                <Text variant="label" style={{ marginTop: 14, marginBottom: 8 }}>
                  3. CATEGORY:
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {(['Sales', 'Support', 'Marketing', 'General'] as const).map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catPill,
                        {
                          backgroundColor: newWorkflowCategory === cat ? colors.primary : colors.background,
                          borderColor: newWorkflowCategory === cat ? colors.primary : colors.border,
                        }
                      ]}
                      onPress={() => setNewWorkflowCategory(cat)}
                    >
                      <Text variant="caption" weight="bold" color={newWorkflowCategory === cat ? '#FFF' : colors.textPrimary}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Shared Switch */}
                <View style={[styles.sharedCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" weight="bold" color={colors.textPrimary}>
                      Shared Workflow
                    </Text>
                    <Text variant="caption" color={colors.textMuted}>
                      Runs seamlessly across {selectedPlatforms.join(', ')}
                    </Text>
                  </View>
                  <Switch
                    value={isSharedWorkflow}
                    onValueChange={setIsSharedWorkflow}
                    trackColor={{ false: colors.border, true: colors.primary + '80' }}
                    thumbColor={isSharedWorkflow ? colors.primary : colors.textMuted}
                  />
                </View>

                {/* Bottom Modal Actions */}
                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    style={[styles.backStepBtn, { borderColor: colors.border }]}
                    onPress={() => setCreateStep(1)}
                  >
                    <Text variant="caption" weight="bold" color={colors.textMuted}>
                      Back
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.startBuildBtn, { backgroundColor: colors.primary }]}
                    onPress={handleStartBuildingWorkflow}
                  >
                    <Text variant="body" weight="bold" color="#FFF">
                      Build Workflow ➔
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* LANDSCAPE ORIENTATION CONFIRMATION POPUP MODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={isLandscapeConfirmOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsLandscapeConfirmOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.landscapeConfirmCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.landscapeIconBox, { backgroundColor: colors.primary + '18' }]}>
              <RotateCcw size={32} color={colors.primary} />
            </View>

            <Text variant="h2" weight="bold" color={colors.textPrimary} style={{ textAlign: 'center', marginTop: 14 }}>
              Switch to Landscape View?
            </Text>

            <Text variant="caption" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 8, marginBottom: 20, lineHeight: 18 }}>
              The Visual Workflow Builder Canvas works best in Widescreen Landscape orientation. Your screen will automatically rotate for node editing.
            </Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.backStepBtn, { borderColor: colors.border }]}
                onPress={() => setIsLandscapeConfirmOpen(false)}
              >
                <Text variant="caption" weight="bold" color={colors.textMuted}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.startBuildBtn, { backgroundColor: colors.primary }]}
                onPress={async () => {
                  setIsLandscapeConfirmOpen(false);
                  await lockLandscape();
                  if (pendingWorkflowToBuild) {
                    setSelectedWorkflow(pendingWorkflowToBuild);
                    setForceLandscapeLayout(true);
                    setIsBuilderModalOpen(true);
                  }
                }}
              >
                <Text variant="body" weight="bold" color="#FFF">
                  OK, Rotate Screen ➔
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* FULL-SCREEN WIDESCREEN LANDSCAPE WEB PARITY WORKFLOW BUILDER MODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={isBuilderModalOpen}
        animationType="slide"
        onRequestClose={closeWorkflowBuilder}
      >
        {selectedWorkflow && (
          <View style={[styles.builderScreen, { backgroundColor: '#F8FAFC' }]}>
            {/* Web Parity Header Bar */}
            <View style={styles.webParityHeader}>
              {/* Left: Go Back & Title */}
              <View style={styles.webHeaderLeft}>
                <TouchableOpacity 
                  style={styles.webGoBackBtn} 
                  onPress={closeWorkflowBuilder}
                >
                  <ArrowLeft size={16} color="#475569" />
                  <Text variant="caption" weight="bold" color="#475569">
                    GO BACK
                  </Text>
                </TouchableOpacity>

                {!showActionsSidebar && (
                  <TouchableOpacity 
                    style={[styles.webGoBackBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]} 
                    onPress={() => setShowActionsSidebar(true)}
                  >
                    <Plus size={14} color="#059669" />
                    <Text variant="caption" weight="bold" color="#059669" style={{ fontSize: 10 }}>
                      + ACTIONS PALETTE
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.webTitleBadgeGroup}>
                  <Text variant="body" weight="bold" color="#0F172A" style={{ textTransform: 'uppercase' }}>
                    {selectedWorkflow.name}
                  </Text>
                  <View style={styles.sharedPill}>
                    <Text variant="caption" weight="bold" color="#FFFFFF" style={{ fontSize: 9 }}>
                      SHARED
                    </Text>
                  </View>
                </View>
              </View>

              {/* Center: Deployment Channel Checkboxes */}
              <View style={styles.deploymentRow}>
                <Text variant="caption" weight="bold" color="#94A3B8" style={{ marginRight: 4, fontSize: 10 }}>
                  DEPLOYMENT:
                </Text>

                <TouchableOpacity 
                  style={styles.channelCheckItem}
                  onPress={() => togglePlatformSelection('WHATSAPP')}
                >
                  <View style={[styles.checkBoxSquare, { backgroundColor: selectedPlatforms.includes('WHATSAPP') ? '#059669' : 'transparent', borderColor: selectedPlatforms.includes('WHATSAPP') ? '#059669' : '#CBD5E1' }]}>
                    {selectedPlatforms.includes('WHATSAPP') && <Check size={10} color="#FFF" strokeWidth={3} />}
                  </View>
                  <Text variant="caption" weight="bold" color={selectedPlatforms.includes('WHATSAPP') ? '#0F172A' : '#64748B'} style={{ fontSize: 11 }}>
                    WhatsApp
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.channelCheckItem}
                  onPress={() => togglePlatformSelection('INSTAGRAM')}
                >
                  <View style={[styles.checkBoxSquare, { backgroundColor: selectedPlatforms.includes('INSTAGRAM') ? '#8B5CF6' : 'transparent', borderColor: selectedPlatforms.includes('INSTAGRAM') ? '#8B5CF6' : '#CBD5E1' }]}>
                    {selectedPlatforms.includes('INSTAGRAM') && <Check size={10} color="#FFF" strokeWidth={3} />}
                  </View>
                  <Text variant="caption" weight="bold" color={selectedPlatforms.includes('INSTAGRAM') ? '#0F172A' : '#64748B'} style={{ fontSize: 11 }}>
                    Instagram
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.channelCheckItem}
                  onPress={() => togglePlatformSelection('FACEBOOK')}
                >
                  <View style={[styles.checkBoxSquare, { backgroundColor: selectedPlatforms.includes('FACEBOOK') ? '#1877F2' : 'transparent', borderColor: selectedPlatforms.includes('FACEBOOK') ? '#1877F2' : '#CBD5E1' }]}>
                    {selectedPlatforms.includes('FACEBOOK') && <Check size={10} color="#FFF" strokeWidth={3} />}
                  </View>
                  <Text variant="caption" weight="bold" color={selectedPlatforms.includes('FACEBOOK') ? '#0F172A' : '#64748B'} style={{ fontSize: 11 }}>
                    Facebook
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Right: Save Workflow Button */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity 
                  style={styles.testSandboxToggleBtn}
                  onPress={() => setShowTestSandbox(!showTestSandbox)}
                >
                  <Play size={12} color="#059669" />
                  <Text variant="caption" weight="bold" color="#059669" style={{ fontSize: 10 }}>
                    {showTestSandbox ? 'Hide Sandbox' : 'Test Flow'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.webSaveFlowBtn}
                  onPress={handleSaveWorkflow}
                >
                  <Save size={14} color="#FFF" />
                  <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    SAVE WORKFLOW
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showSaveSuccess && (
              <View style={[styles.saveToast, { backgroundColor: '#059669' }]}>
                <CheckCircle2 size={16} color="#FFF" />
                <Text variant="caption" weight="bold" color="#FFF">
                  Workflow saved successfully!
                </Text>
              </View>
            )}

            {/* Main Body Layout: Left Sidebar + Center React Flow Canvas */}
            <View style={styles.webBuilderBody}>
              {/* Left Sidebar (ACTIONS Palette) */}
              {showActionsSidebar && (
                <View style={styles.leftActionsSidebar}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingRight: 4 }}>
                    <Text variant="caption" weight="bold" color="#94A3B8" style={styles.actionsHeaderTitle}>
                      ACTIONS
                    </Text>
                    <TouchableOpacity 
                      style={{ padding: 4, backgroundColor: '#F1F5F9', borderRadius: 6 }} 
                      onPress={() => setShowActionsSidebar(false)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X size={14} color="#64748B" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    {/* Category 1: MESSAGES */}
                    <View style={styles.paletteCategoryGroup}>
                      <Text variant="caption" weight="bold" color="#059669" style={styles.categoryTitle}>
                        MESSAGES
                      </Text>

                      <TouchableOpacity 
                        style={styles.paletteItemBtn}
                        onPress={() => handleAddPaletteNode('PLAIN_MESSAGE', 'PLAIN MESSAGE', '#10B981', 'Enter message...')}
                      >
                        <MessageSquare size={13} color="#10B981" />
                        <Text variant="caption" weight="bold" color="#334155" style={styles.paletteItemText}>
                          PLAIN MESSAGE
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.paletteItemBtn}
                        onPress={() => handleAddPaletteNode('BUTTONS', 'MESSAGE + BUTTONS', '#4F46E5', 'Options...', ['Option 1', 'Option 2'])}
                      >
                        <MousePointer2 size={13} color="#4F46E5" />
                        <Text variant="caption" weight="bold" color="#334155" style={styles.paletteItemText}>
                          MESSAGE + BUTTONS
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.paletteItemBtn}
                        onPress={() => handleAddPaletteNode('IMAGE', 'MESSAGE + IMAGE', '#8B5CF6', 'Image caption...')}
                      >
                        <ImageIcon size={13} color="#8B5CF6" />
                        <Text variant="caption" weight="bold" color="#334155" style={styles.paletteItemText}>
                          MESSAGE + IMAGE
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.paletteItemBtn}
                        onPress={() => handleAddPaletteNode('VIDEO', 'MESSAGE + VIDEO', '#EC4899', 'Video caption...')}
                      >
                        <Video size={13} color="#EC4899" />
                        <Text variant="caption" weight="bold" color="#334155" style={styles.paletteItemText}>
                          MESSAGE + VIDEO
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Category 2: COMMERCE & CATALOG */}
                    <View style={styles.paletteCategoryGroup}>
                      <Text variant="caption" weight="bold" color="#0D9488" style={styles.categoryTitle}>
                        COMMERCE & CATALOG
                      </Text>

                      <TouchableOpacity 
                        style={styles.paletteItemBtn}
                        onPress={() => handleAddPaletteNode('CATALOG', 'SEND CATALOG PRODUCT', '#0D9488', 'Select product catalog...')}
                      >
                        <ShoppingBag size={13} color="#0D9488" />
                        <Text variant="caption" weight="bold" color="#334155" style={styles.paletteItemText}>
                          SEND CATALOG PRODUCT
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Category 3: INTEGRATIONS & MEETINGS */}
                    <View style={styles.paletteCategoryGroup}>
                      <Text variant="caption" weight="bold" color="#D97706" style={styles.categoryTitle}>
                        INTEGRATIONS & MEETINGS
                      </Text>

                      <TouchableOpacity 
                        style={styles.paletteItemBtn}
                        onPress={() => handleAddPaletteNode('GOOGLE_MEET', 'GOOGLE MEET & CALENDAR', '#2563EB', 'Schedule meeting link...')}
                      >
                        <Calendar size={13} color="#2563EB" />
                        <Text variant="caption" weight="bold" color="#334155" style={styles.paletteItemText}>
                          GOOGLE MEET & CALENDAR
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.paletteItemBtn}
                        onPress={() => handleAddPaletteNode('BRANCH', 'SET A CONDITION', '#F59E0B', 'If lead score > 70')}
                      >
                        <GitBranch size={13} color="#F59E0B" />
                        <Text variant="caption" weight="bold" color="#334155" style={styles.paletteItemText}>
                          SET A CONDITION
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.paletteItemBtn}
                        onPress={() => handleAddPaletteNode('TALK_TO_HUMAN', 'TALK TO HUMAN', '#D97706', 'Transfer to sales agent...')}
                      >
                        <User size={13} color="#D97706" />
                        <Text variant="caption" weight="bold" color="#334155" style={styles.paletteItemText}>
                          TALK TO HUMAN
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Center Canvas Area (React Flow Dotted Canvas with SVG Bezier Wires) */}
              <View style={styles.centerCanvasContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.canvasDotGrid, { padding: 30, minWidth: 950, transform: [{ scale: zoomLevel }] }]}
                  >
                    {/* Wiring Instruction & Mode Banner */}
                    {connectingSource ? (
                      <View style={[styles.wiringBannerBar, { backgroundColor: '#2563EB', borderColor: '#3B82F6', paddingVertical: 10, maxWidth: 750 }]}>
                        <Zap size={16} color="#FFF" />
                        <View style={{ flex: 1 }}>
                          <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 11 }}>
                            🔌 STEP 2 OF 2: NOW TAP ON TARGET BLOCK CARD!
                          </Text>
                          <Text variant="caption" color="#DBEAFE" style={{ fontSize: 9, marginTop: 1 }}>
                            Source selected: "{connectingSource.title}" ➔ Ab jis block se wire connect karni hai, us block card par tap karein!
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => setConnectingSource(null)} style={{ padding: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 6 }}>
                          <X size={14} color="#FFF" strokeWidth={3} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={[styles.wiringBannerBar, { backgroundColor: '#0F172A', borderColor: '#1E293B', paddingVertical: 8, maxWidth: 750 }]}>
                        <Sparkles size={14} color="#10B981" />
                        <View style={{ flex: 1 }}>
                          <Text variant="caption" weight="bold" color="#34D399" style={{ fontSize: 10 }}>
                            🔌 HOW TO CONNECT WIRES (2 EASY STEPS):
                          </Text>
                          <Text variant="caption" color="#CBD5E1" style={{ fontSize: 9, marginTop: 2 }}>
                            1️⃣ Block ke bottom me <Text weight="bold" color="#60A5FA">"🔌 CONNECT WIRE"</Text> tap karein ➔ 2️⃣ Target Block par tap karein!
                          </Text>
                        </View>
                        <TouchableOpacity 
                          style={{ backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#38BDF8' }}
                          onPress={() => setShowWireGuideModal(true)}
                        >
                          <Text variant="caption" weight="bold" color="#38BDF8" style={{ fontSize: 9 }}>
                            ❓ Wire Guide
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {wireSuccessToast && (
                      <View style={styles.wireToastBar}>
                        <CheckCircle2 size={14} color="#FFF" />
                        <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 10 }}>
                          {wireSuccessToast}
                        </Text>
                      </View>
                    )}

                    {/* Canvas Relative Container for SVG Overlay + Cards */}
                    <View style={{ position: 'relative', width: 1400, height: 1300 }}>
                      {/* SVG Canvas Wires Overlay Layer */}
                      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
                        {(selectedWorkflow.edges || []).map((edge) => {
                          const srcIdx = selectedWorkflow.nodes.findIndex(n => n.id === edge.source);
                          const tgtIdx = selectedWorkflow.nodes.findIndex(n => n.id === edge.target);
                          const srcNode = selectedWorkflow.nodes[srcIdx];
                          const tgtNode = selectedWorkflow.nodes[tgtIdx];
                          if (!srcNode || !tgtNode) return null;

                          const cardWidth = ['h4_3a', 'h4_3b', 'h4_3c'].includes(srcNode.id) ? 200 : 220;
                          const tgtWidth = ['h4_3a', 'h4_3b', 'h4_3c'].includes(tgtNode.id) ? 200 : 220;

                          const nodeSX = getNodeX(srcNode, srcIdx);
                          const nodeSY = getNodeY(srcNode, srcIdx);
                          const nodeTX = getNodeX(tgtNode, tgtIdx);
                          const nodeTY = getNodeY(tgtNode, tgtIdx);

                          let startX = nodeSX + cardWidth / 2;
                          let startY = nodeSY + 120;

                          if (edge.sourceHandle && edge.sourceHandle.startsWith('btn-')) {
                            const btnIdx = parseInt(edge.sourceHandle.replace('btn-', ''), 10) || 0;
                            startX = nodeSX + cardWidth - 8;
                            startY = nodeSY + 72 + (btnIdx * 32);
                          }

                          const endX = nodeTX + tgtWidth / 2;
                          const endY = nodeTY + 2;

                          const deltaY = Math.abs(endY - startY);
                          const controlY1 = startY + Math.max(30, deltaY * 0.4);
                          const controlY2 = endY - Math.max(30, deltaY * 0.4);

                          const pathD = `M ${startX} ${startY} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${endY}`;

                          return (
                            <Path
                              key={`path_${edge.id}`}
                              d={pathD}
                              stroke="#64748B"
                              strokeWidth="2.5"
                              strokeDasharray="5, 4"
                              fill="none"
                            />
                          );
                        })}
                      </Svg>

                      {/* SVG Midpoint Wire Delete Circles (X) Overlay */}
                      {(selectedWorkflow.edges || []).map((edge) => {
                        const srcIdx = selectedWorkflow.nodes.findIndex(n => n.id === edge.source);
                        const tgtIdx = selectedWorkflow.nodes.findIndex(n => n.id === edge.target);
                        const srcNode = selectedWorkflow.nodes[srcIdx];
                        const tgtNode = selectedWorkflow.nodes[tgtIdx];
                        if (!srcNode || !tgtNode) return null;

                        const cardWidth = ['h4_3a', 'h4_3b', 'h4_3c'].includes(srcNode.id) ? 200 : 220;
                        const tgtWidth = ['h4_3a', 'h4_3b', 'h4_3c'].includes(tgtNode.id) ? 200 : 220;

                        const nodeSX = getNodeX(srcNode, srcIdx);
                        const nodeSY = getNodeY(srcNode, srcIdx);
                        const nodeTX = getNodeX(tgtNode, tgtIdx);
                        const nodeTY = getNodeY(tgtNode, tgtIdx);

                        let startX = nodeSX + cardWidth / 2;
                        let startY = nodeSY + 120;

                        if (edge.sourceHandle && edge.sourceHandle.startsWith('btn-')) {
                          const btnIdx = parseInt(edge.sourceHandle.replace('btn-', ''), 10) || 0;
                          startX = nodeSX + cardWidth - 8;
                          startY = nodeSY + 72 + (btnIdx * 32);
                        }

                        const endX = nodeTX + tgtWidth / 2;
                        const endY = nodeTY + 2;

                        const midX = (startX + endX) / 2;
                        const midY = (startY + endY) / 2;

                        return (
                          <TouchableOpacity
                            key={`del_${edge.id}`}
                            activeOpacity={0.8}
                            style={[styles.wireDeleteCircle, { left: midX - 10, top: midY - 10 }]}
                            onPress={() => handleDeleteWire(edge.id)}
                          >
                            <X size={10} color="#64748B" strokeWidth={3} />
                          </TouchableOpacity>
                        );
                      })}

                      {/* Absolute Node Cards Layout */}
                      {selectedWorkflow.nodes?.map((node, index) => {
                        const isTrigger = node.type === 'TRIGGER';
                        const isButtons = node.type === 'BUTTONS';
                        const buttonsList = node.buttons || ['Option 1'];
                        const cardW = ['h4_3a', 'h4_3b', 'h4_3c'].includes(node.id) ? 200 : 220;
                        const posX = getNodeX(node, index);
                        const posY = getNodeY(node, index);

                        return (
                          <View
                            key={node.id}
                            style={[
                              styles.webNodeCardWrapper,
                              {
                                position: 'absolute',
                                left: posX,
                                top: posY,
                                width: cardW,
                                marginHorizontal: 0,
                                marginVertical: 0,
                              }
                            ]}
                          >
                            {!isTrigger && (
                              <TouchableOpacity
                                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                                style={[styles.topHandleDot, { backgroundColor: connectingSource ? '#3B82F6' : '#94A3B8' }]}
                                onPress={() => {
                                  if (connectingSource) {
                                    handleCompleteWireConnection(node.id);
                                  }
                                }}
                              />
                            )}

                            <TouchableOpacity
                              activeOpacity={0.9}
                              style={[
                                styles.reactFlowNodeCard,
                                {
                                  width: cardW,
                                  borderColor: connectingSource ? (connectingSource.nodeId === node.id ? '#2563EB' : '#3B82F6') : (isTrigger ? '#059669' : (node.color || '#6366F1')),
                                  borderWidth: connectingSource ? 2.5 : 1,
                                  backgroundColor: connectingSource && connectingSource.nodeId !== node.id ? '#EFF6FF' : '#FFFFFF',
                                }
                              ]}
                              onPress={() => {
                                if (connectingSource) {
                                  handleCompleteWireConnection(node.id);
                                } else {
                                  setEditingNode(node);
                                }
                              }}
                            >
                              <View style={[styles.nodeCardHeaderBar, { backgroundColor: node.color || '#10B981' }]}>
                                <View style={styles.nodeHeaderTitleRow}>
                                  <View style={styles.stepNumBadge}>
                                    <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 8 }}>
                                      STEP {index + 1}
                                    </Text>
                                  </View>
                                  {isTrigger ? <Zap size={11} color="#FFF" /> : getNodeIcon(node.type, '#FFF')}
                                  <Text variant="caption" weight="bold" color="#FFF" style={styles.nodeHeaderTitleText}>
                                    {isTrigger ? 'START FLOW' : node.title}
                                  </Text>
                                </View>
                                {!isTrigger && (
                                  <TouchableOpacity style={styles.deleteNodeIconBtn} onPress={() => handleDeleteNode(node.id)}>
                                    <X size={10} color="#FFF" strokeWidth={3} />
                                  </TouchableOpacity>
                                )}
                              </View>

                              <View style={styles.nodeCardBody}>
                                {isTrigger ? (
                                  <View style={styles.triggerKeywordBox}>
                                    <Text variant="caption" weight="bold" color="#34D399" style={{ fontSize: 10 }}>
                                      "{node.configValue || 'HOSPITAL'}"
                                    </Text>
                                  </View>
                                ) : (
                                  <View style={styles.nodeContentBox}>
                                    <Text variant="caption" color="#475569" style={styles.nodeMessageText} numberOfLines={3}>
                                      "{node.configValue}"
                                    </Text>
                                    {isButtons && (
                                      <View style={styles.buttonOptionsStack}>
                                        {buttonsList.map((btnLabel, bIdx) => (
                                          <TouchableOpacity
                                            key={bIdx}
                                            activeOpacity={0.7}
                                            style={styles.buttonOptionPill}
                                            onPress={() => {
                                              if (connectingSource) {
                                                handleCompleteWireConnection(node.id);
                                              } else {
                                                handleStartWireConnection(node.id, `btn-${bIdx}`, `${node.title} ➔ ${btnLabel}`);
                                              }
                                            }}
                                          >
                                            <Text variant="caption" weight="bold" color="#4F46E5" style={styles.buttonPillText}>
                                              {btnLabel}
                                            </Text>
                                            <TouchableOpacity
                                              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                              style={styles.rightHandleDot}
                                              onPress={() => {
                                                if (connectingSource) {
                                                  handleCompleteWireConnection(node.id);
                                                } else {
                                                  handleStartWireConnection(node.id, `btn-${bIdx}`, `${node.title} ➔ ${btnLabel}`);
                                                }
                                              }}
                                            />
                                          </TouchableOpacity>
                                        ))}
                                      </View>
                                    )}
                                  </View>
                                )}

                                <TouchableOpacity
                                  style={[styles.explicitWireBtn, { backgroundColor: connectingSource?.nodeId === node.id ? '#DBEAFE' : '#F1F5F9' }]}
                                  onPress={() => {
                                    if (connectingSource) {
                                      handleCompleteWireConnection(node.id);
                                    } else {
                                      handleStartWireConnection(node.id, undefined, `Step ${index + 1}: ${node.title}`);
                                    }
                                  }}
                                >
                                  <Zap size={10} color={connectingSource?.nodeId === node.id ? '#2563EB' : '#059669'} />
                                  <Text variant="caption" weight="bold" color={connectingSource?.nodeId === node.id ? '#2563EB' : '#059669'} style={{ fontSize: 9 }}>
                                    {connectingSource?.nodeId === node.id ? 'CONNECTING...' : '🔌 CONNECT WIRE'}
                                  </Text>
                                </TouchableOpacity>
                              </View>

                              <TouchableOpacity
                                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                                style={[styles.bottomHandleDot, { backgroundColor: connectingSource?.nodeId === node.id ? '#3B82F6' : (node.color || '#059669') }]}
                                onPress={() => {
                                  if (connectingSource) {
                                    handleCompleteWireConnection(node.id);
                                  } else {
                                    handleStartWireConnection(node.id, undefined, `Step ${index + 1}: ${node.title}`);
                                  }
                                }}
                              />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                </ScrollView>

                {/* Bottom Left Floating Canvas Controls */}
                <View style={styles.bottomLeftControlsBar}>
                  <TouchableOpacity style={styles.canvasControlBtn} onPress={() => setZoomLevel(Math.min(zoomLevel + 0.1, 1.3))}>
                    <ZoomIn size={13} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.canvasControlBtn} onPress={() => setZoomLevel(Math.max(zoomLevel - 0.1, 0.7))}>
                    <ZoomOut size={13} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.canvasControlBtn} onPress={() => setZoomLevel(1)}>
                    <RotateCcw size={13} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Bottom Right Watermark */}
                <View style={styles.bottomRightWatermark}>
                  <Text variant="caption" weight="bold" color="#94A3B8" style={{ fontSize: 9 }}>
                    React Flow • UwoConnect Canvas
                  </Text>
                </View>
              </View>

              {/* Right Side Test Sandbox Side Panel (If toggled) */}
              {showTestSandbox && (
                <View style={styles.rightTestSandboxPanel}>
                  <View style={styles.sandboxPanelHeader}>
                    <Play size={14} color="#059669" />
                    <Text variant="caption" weight="bold" color="#0F172A">
                      Flow Test Sandbox
                    </Text>
                    <TouchableOpacity onPress={() => setShowTestSandbox(false)} style={{ marginLeft: 'auto' }}>
                      <X size={14} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  <Text variant="caption" color="#64748B" style={{ marginBottom: 6, fontSize: 10 }}>
                    Simulate step-by-step trigger & message execution:
                  </Text>

                  <TextInput
                    style={styles.sandboxInput}
                    placeholder="Enter test message..."
                    value={testInputText}
                    onChangeText={setTestInputText}
                  />

                  <TouchableOpacity style={styles.sandboxRunBtn} onPress={handleRunLiveTest} disabled={isTesting}>
                    {isTesting ? <ActivityIndicator size="small" color="#FFF" /> : <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 10 }}>RUN SIMULATION</Text>}
                  </TouchableOpacity>

                  {testLogs.length > 0 && (
                    <ScrollView style={styles.sandboxLogsBox}>
                      {testLogs.map((log, idx) => (
                        <Text key={idx} variant="caption" color="#38BDF8" style={{ fontSize: 9, marginVertical: 2, fontFamily: 'monospace' }}>{log}</Text>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}
            </View>

            {/* Node Inspector & Parameter Edit Modal (Web Parity) */}
            {editingNode && (
              <Modal
                visible={!!editingNode}
                transparent
                animationType="fade"
                onRequestClose={() => setEditingNode(null)}
              >
                <View style={styles.modalOverlay}>
                  <View style={[styles.nodeInspectorCard, { backgroundColor: '#FFFFFF' }]}>
                    {/* Header */}
                    <View style={[styles.inspectorHeaderBar, { backgroundColor: editingNode.color || '#10B981' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {getNodeIcon(editingNode.type, '#FFF')}
                        <Text variant="body" weight="bold" color="#FFF" style={{ textTransform: 'uppercase', fontSize: 11 }}>
                          EDIT NODE: {editingNode.title}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => setEditingNode(null)} style={{ padding: 4 }}>
                        <X size={16} color="#FFF" />
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={{ padding: 14 }} showsVerticalScrollIndicator={false}>
                      {/* Node Title Field */}
                      <Text variant="caption" weight="bold" color="#475569" style={{ marginBottom: 4 }}>
                        STEP TITLE
                      </Text>
                      <TextInput
                        style={styles.inspectorInput}
                        value={editingNode.title}
                        onChangeText={(txt) => setEditingNode({ ...editingNode, title: txt })}
                      />

                      {/* Node Config / Message Field */}
                      <Text variant="caption" weight="bold" color="#475569" style={{ marginTop: 10, marginBottom: 4 }}>
                        {editingNode.type === 'TRIGGER' ? 'TRIGGER KEYWORD(S)' : 'MESSAGE / PROMPT TEXT'}
                      </Text>
                      <TextInput
                        style={[styles.inspectorInput, { minHeight: 50 }]}
                        multiline
                        value={editingNode.configValue}
                        onChangeText={(txt) => setEditingNode({ ...editingNode, configValue: txt })}
                      />

                      {/* If Node Type is BUTTONS: Button Options Editor */}
                      {editingNode.type === 'BUTTONS' && (
                        <View style={{ marginTop: 12 }}>
                          <Text variant="caption" weight="bold" color="#4F46E5" style={{ marginBottom: 6 }}>
                            INTERACTIVE BUTTON OPTIONS (UP TO 3)
                          </Text>

                          {(editingNode.buttons || ['Option 1']).map((btnText, bIdx) => (
                            <View key={bIdx} style={styles.buttonOptionEditRow}>
                              <TextInput
                                style={styles.buttonOptionInput}
                                value={btnText}
                                onChangeText={(txt) => handleUpdateButtonOption(bIdx, txt)}
                              />
                              <TouchableOpacity onPress={() => handleDeleteButtonOption(bIdx)} style={{ padding: 6 }}>
                                <Trash2 size={14} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                          ))}

                          {(editingNode.buttons || []).length < 3 && (
                            <TouchableOpacity style={styles.addOptionBtn} onPress={handleAddButtonOption}>
                              <Plus size={12} color="#4F46E5" />
                              <Text variant="caption" weight="bold" color="#4F46E5">
                                ADD BUTTON OPTION
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}

                      {/* Direct Wire Connections Section */}
                      <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: '#E2E8F0' }}>
                        <Text variant="caption" weight="bold" color="#059669" style={{ marginBottom: 6 }}>
                          🔌 WIRE CONNECTIONS (CONNECT TO ANOTHER STEP)
                        </Text>

                        {/* Existing outgoing edges */}
                        {(selectedWorkflow.edges || []).filter(e => e.source === editingNode.id).length > 0 ? (
                          (selectedWorkflow.edges || []).filter(e => e.source === editingNode.id).map((edge) => {
                            const targetNode = selectedWorkflow.nodes.find(n => n.id === edge.target);
                            if (!targetNode) return null;
                            return (
                              <View key={edge.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0FDF4', padding: 8, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#BBF7D0' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                                  <Zap size={12} color="#059669" />
                                  <Text variant="caption" weight="bold" color="#166534" style={{ fontSize: 10 }}>
                                    {edge.sourceHandle ? `Option [${edge.sourceHandle.replace('btn-', 'Button ')}] ➔ ${targetNode.title}` : `➔ ${targetNode.title}`}
                                  </Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteWire(edge.id)} style={{ padding: 4 }}>
                                  <X size={12} color="#EF4444" strokeWidth={3} />
                                </TouchableOpacity>
                              </View>
                            );
                          })
                        ) : (
                          <Text variant="caption" color="#94A3B8" style={{ fontSize: 10, marginBottom: 6, fontStyle: 'italic' }}>
                            No outgoing wires connected yet.
                          </Text>
                        )}

                        <Text variant="caption" color="#64748B" style={{ fontSize: 9, marginTop: 4, marginBottom: 6 }}>
                          Tap target step to instantly connect wire:
                        </Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 4 }}>
                          {selectedWorkflow.nodes.filter(n => n.id !== editingNode.id).map(targetNode => (
                            <TouchableOpacity
                              key={`conn_${targetNode.id}`}
                              style={{ backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                              onPress={() => {
                                handleStartWireConnection(editingNode.id, undefined, editingNode.title);
                                handleCompleteWireConnection(targetNode.id);
                              }}
                            >
                              <Plus size={12} color="#4F46E5" />
                              <Text variant="caption" weight="bold" color="#4F46E5" style={{ fontSize: 10 }}>
                                Connect ➔ {targetNode.title}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.inspectorActionRow}>
                        <TouchableOpacity 
                          style={styles.deleteNodeBtnModal}
                          onPress={() => {
                            handleDeleteNode(editingNode.id);
                            setEditingNode(null);
                          }}
                        >
                          <Trash2 size={14} color="#EF4444" />
                          <Text variant="caption" weight="bold" color="#EF4444">
                            Delete Step
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.saveNodeBtnModal}
                          onPress={() => handleSaveNodeEdit(editingNode)}
                        >
                          <Check size={14} color="#FFF" />
                          <Text variant="caption" weight="bold" color="#FFF">
                            Apply Changes
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            )}

            {/* Illustrated Wire Guide Modal */}
            {showWireGuideModal && (
              <Modal
                visible={showWireGuideModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowWireGuideModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={[styles.nodeInspectorCard, { backgroundColor: '#FFFFFF', maxWidth: 440 }]}>
                    <View style={[styles.inspectorHeaderBar, { backgroundColor: '#0F172A' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={16} color="#10B981" />
                        <Text variant="body" weight="bold" color="#FFF" style={{ fontSize: 12 }}>
                          🔌 WIRE JODNE KA AASAN TAREEQA
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => setShowWireGuideModal(false)} style={{ padding: 4 }}>
                        <X size={16} color="#FFF" />
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
                      <Text variant="body" weight="bold" color="#0F172A" style={{ marginBottom: 10, fontSize: 13 }}>
                        Wires (Lines) connect karne ke 2 aasan tareeqe:
                      </Text>

                      {/* Method 1 */}
                      <View style={{ backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#BFDBFE' }}>
                        <Text variant="caption" weight="bold" color="#1D4ED8" style={{ fontSize: 11, marginBottom: 6 }}>
                          ✨ TAREEQA 1: Direct Screen Par Touch Karein
                        </Text>
                        <Text variant="caption" color="#1E40AF" style={{ fontSize: 10, lineHeight: 18 }}>
                          1️⃣ Block ke niche <Text weight="bold" color="#1D4ED8">"🔌 CONNECT WIRE"</Text> par tap karein.{"\n"}
                          2️⃣ Ab jis doosre Block se jodna hai, <Text weight="bold" color="#1D4ED8">us Block par tap kar dein</Text>! Wire apne aap jud jayegi!
                        </Text>
                      </View>

                      {/* Method 2 */}
                      <View style={{ backgroundColor: '#F0FDF4', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#BBF7D0' }}>
                        <Text variant="caption" weight="bold" color="#15803D" style={{ fontSize: 11, marginBottom: 6 }}>
                          ⚙️ TAREEQA 2: Step Edit Menu Se Jodein
                        </Text>
                        <Text variant="caption" color="#166534" style={{ fontSize: 10, lineHeight: 18 }}>
                          1️⃣ Block par tap karke Edit menu kholein.{"\n"}
                          2️⃣ Niche <Text weight="bold" color="#15803D">"Wire Connections"</Text> me target step ke naam par tap karein!
                        </Text>
                      </View>

                      {/* Disconnect Wire */}
                      <View style={{ backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#FECACA' }}>
                        <Text variant="caption" weight="bold" color="#B91C1C" style={{ fontSize: 11, marginBottom: 6 }}>
                          ❌ Wire Kaatne / Hatane Ka Tareeqa:
                        </Text>
                        <Text variant="caption" color="#991B1B" style={{ fontSize: 10, lineHeight: 18 }}>
                          Har wire ke beech me chhota <Text weight="bold" color="#B91C1C">(X)</Text> button hai. Us <Text weight="bold" color="#B91C1C">(X)</Text> par tap karte hi wire hat jayegi.
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={{ backgroundColor: '#059669', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}
                        onPress={() => setShowWireGuideModal(false)}
                      >
                        <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 11 }}>
                          SAMAJH GAYE, SHURU KAREIN ➔
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            )}
          </View>
        )}
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  addFlowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  summaryCard: {
    marginBottom: 16,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTextGroup: {
    flex: 1,
  },
  summarySubtitle: {
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  workflowCard: {
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  channelIconBox: {
    marginRight: 10,
  },
  titleBox: {
    flex: 1,
  },
  switchWrapper: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  flowDesc: {
    marginBottom: 12,
    lineHeight: 18,
  },
  triggerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  statsCol: {
    flex: 1,
  },
  openBuilderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  noteCard: {
    marginTop: 10,
    padding: 14,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 24,
    padding: 20,
  },
  landscapeConfirmCard: {
    width: '90%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  landscapeIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  scratchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  selectedTemplateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  platformGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  platformCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 90,
  },
  checkCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sharedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 16,
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    width: '100%',
  },
  backStepBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  startBuildBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  // BUILDER MODAL STYLES
  builderScreen: {
    flex: 1,
  },
  builderHeader: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  builderBody: {
    flex: 1,
  },
  closeBuilderBtn: {
    padding: 6,
  },
  builderTitleGroup: {
    flex: 1,
    marginHorizontal: 12,
  },
  saveFlowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  builderContent: {
    padding: 14,
    paddingBottom: 40,
  },
  flowMetaCard: {
    padding: 12,
    marginBottom: 14,
  },
  flowMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  canvasHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addNodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  nodeWrapper: {
    alignItems: 'center',
  },
  nodeCard: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
  },
  nodeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nodeBadgeBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  configEditBox: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  configInput: {
    fontSize: 12,
    minHeight: 32,
    padding: 0,
  },
  connectorLineBox: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    marginVertical: 2,
  },
  lineVertical: {
    position: 'absolute',
    width: 2,
    height: '100%',
  },
  arrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  testConsoleCard: {
    padding: 12,
  },
  consoleHeader: {
    marginBottom: 6,
  },
  testInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 6,
    height: 40,
  },
  testInput: {
    flex: 1,
    fontSize: 12,
  },
  runTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logsBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  logLine: {
    fontSize: 10,
    lineHeight: 16,
    fontFamily: 'monospace',
  },
  // WEB PARITY BUILDER STYLES
  webParityHeader: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  webHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  webGoBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  webTitleBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sharedPill: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deploymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  channelCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkBoxSquare: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testSandboxToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  webSaveFlowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#059669',
  },
  webBuilderBody: {
    flex: 1,
    flexDirection: 'row',
  },
  leftActionsSidebar: {
    width: 185,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  actionsHeaderTitle: {
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 8,
  },
  paletteCategoryGroup: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 9,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  paletteItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 7,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 5,
  },
  paletteItemText: {
    fontSize: 9,
    letterSpacing: 0.3,
  },
  centerCanvasContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  canvasDotGrid: {
    minWidth: '100%',
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  flowTreeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  webNodeCardWrapper: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 10,
  },
  reactFlowNodeCard: {
    width: 190,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  nodeCardHeaderBar: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nodeHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  nodeHeaderTitleText: {
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  deleteNodeIconBtn: {
    padding: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  nodeCardBody: {
    padding: 8,
  },
  triggerKeywordBox: {
    backgroundColor: '#1E293B',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  nodeContentBox: {},
  nodeMessageText: {
    fontSize: 10,
    lineHeight: 14,
  },
  buttonOptionsStack: {
    marginTop: 6,
    gap: 4,
  },
  buttonOptionPill: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    padding: 5,
    borderRadius: 6,
    position: 'relative',
    alignItems: 'center',
  },
  buttonPillText: {
    fontSize: 9,
    letterSpacing: 0.3,
  },
  rightHandleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366F1',
    position: 'absolute',
    right: -6,
    top: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  topHandleDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: -7,
    alignSelf: 'center',
    zIndex: 10,
    elevation: 4,
  },
  bottomHandleDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#059669',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginTop: -7,
    alignSelf: 'center',
    zIndex: 10,
    elevation: 4,
  },
  bottomLeftControlsBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 2,
    gap: 2,
  },
  canvasControlBtn: {
    padding: 5,
    borderRadius: 4,
    backgroundColor: '#F8FAFC',
  },
  wiringBannerBar: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    width: '100%',
    maxWidth: 600,
  },
  wireToastBar: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  outgoingWiresContainer: {
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  wirePillBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  stepNumBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  inlineWireConnectorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    gap: 2,
  },
  wireLabelPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  bottomRightWatermark: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  rightTestSandboxPanel: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  sandboxPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sandboxInput: {
    height: 34,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 10,
    marginBottom: 6,
  },
  sandboxRunBtn: {
    backgroundColor: '#059669',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  sandboxLogsBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 6,
    borderRadius: 6,
  },
  // INSPECTOR MODAL STYLES
  nodeInspectorCard: {
    width: '90%',
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  inspectorHeaderBar: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inspectorInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 11,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  buttonOptionEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  buttonOptionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#A5B4FC',
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
    marginTop: 4,
  },
  inspectorActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
    marginBottom: 10,
  },
  deleteNodeBtnModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  saveNodeBtnModal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  explicitWireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  wireDeleteCircle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
});
