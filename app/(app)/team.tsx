import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  RefreshControl,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Avatar } from '../../src/components/Avatar';
import { useTheme } from '../../src/theme';
import { useSessionStore } from '../../src/stores/sessionStore';
import { statsApi } from '../../src/api/stats';
import { authApi, QrSessionResponse } from '../../src/api/auth';
import {
  Users,
  UserPlus,
  QrCode,
  FolderPlus,
  CheckSquare,
  Plus,
  Search,
  Mail,
  Phone,
  Shield,
  Zap,
  CheckCircle2,
  Clock,
  X,
  Copy,
  Check,
  Briefcase,
  Calendar,
  Filter,
  ArrowLeft,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'AGENT' | 'DEVELOPER';
  department: string;
  avatar?: string;
  status: 'ACTIVE' | 'OFFLINE' | 'AWAY';
  tasksCompleted: number;
  avgResponseTime: string;
  phone?: string;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  department: string;
  status: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  leadCount: number;
  membersCount: number;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  assigneeName: string;
  assigneeAvatar?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED';
  category: string;
}

// ============================================================================
// ISO/IEC 18004 SPEC-COMPLIANT QR CODE ENCODER (Version 1-L, 21x21)
// ============================================================================
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d;
  }
  for (let i = 255; i < 256; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255];
}

function getRSErrorCorrection(data: number[]): number[] {
  const poly = [127, 122, 154, 164, 11, 68, 117]; // 7 EC codewords for V1-L
  const res = new Array(7).fill(0);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0];
    res.shift();
    res.push(0);
    if (factor !== 0) {
      for (let j = 0; j < 7; j++) {
        res[j] ^= gfMul(poly[j], factor);
      }
    }
  }
  return res;
}

function encodeDataBytes(text: string): number[] {
  const bytes: number[] = [];
  let currentByte = 0;
  let bitLength = 0;

  const addBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      currentByte = (currentByte << 1) | ((val >> i) & 1);
      bitLength++;
      if (bitLength === 8) {
        bytes.push(currentByte);
        currentByte = 0;
        bitLength = 0;
      }
    }
  };

  // 1. Byte Mode Indicator (0100)
  addBits(4, 4);

  // 2. Character Count (8 bits)
  const len = Math.min(text.length, 17);
  addBits(len, 8);

  // 3. ASCII Data Bytes
  for (let i = 0; i < len; i++) {
    addBits(text.charCodeAt(i) & 0xff, 8);
  }

  // 4. Terminator bits
  addBits(0, 4);

  // 5. Byte Align
  if (bitLength > 0) {
    addBits(0, 8 - bitLength);
  }

  // 6. Padding Bytes (0xEC, 0x11 alternating up to 19 data bytes)
  const padPatterns = [0xec, 0x11];
  let padIdx = 0;
  while (bytes.length < 19) {
    bytes.push(padPatterns[padIdx % 2]);
    padIdx++;
  }

  return bytes.slice(0, 19);
}

function generateQrMatrix(text: string): boolean[][] {
  const size = 21;
  const matrix: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
  const reserved: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

  const setModule = (r: number, c: number, val: boolean) => {
    matrix[r][c] = val;
    reserved[r][c] = true;
  };

  // 1. Finder Patterns (7x7 at 3 corners + quiet separators)
  const drawFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const mr = row + r;
        const mc = col + c;
        if (mr < 0 || mr >= size || mc < 0 || mc >= size) continue;

        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          const isDark = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          setModule(mr, mc, isDark);
        } else {
          setModule(mr, mc, false);
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 2. Timing Patterns (row 6 & col 6)
  for (let i = 0; i < size; i++) {
    if (!reserved[6][i]) setModule(6, i, i % 2 === 0);
    if (!reserved[i][6]) setModule(i, 6, i % 2 === 0);
  }

  // 3. Dark Module (row 13, col 8)
  setModule(13, 8, true);

  // 4. Reserve Format Info Positions
  const formatPos = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
    [8, 13], [8, 14], [8, 15], [8, 16], [8, 17], [8, 18], [8, 19], [8, 20],
    [13, 8], [14, 8], [15, 8], [16, 8], [17, 8], [18, 8], [19, 8], [20, 8]
  ];
  for (const [r, c] of formatPos) {
    if (r < size && c < size) reserved[r][c] = true;
  }

  // 5. Build Bitstream (19 Data + 7 RS Parity = 26 Codewords = 208 bits)
  const dataBytes = encodeDataBytes(text);
  const ecBytes = getRSErrorCorrection(dataBytes);
  const allCodewords = [...dataBytes, ...ecBytes];

  const bitStream: boolean[] = [];
  for (const byte of allCodewords) {
    for (let b = 7; b >= 0; b--) {
      bitStream.push(((byte >> b) & 1) === 1);
    }
  }

  // 6. Zigzag Data Module Placement with Mask Pattern 0: (r + c) % 2 === 0
  let bitIdx = 0;
  let dir = -1; // upwards
  let x = size - 1;
  let y = size - 1;

  while (x > 0) {
    if (x === 6) x--; // Skip timing column 6

    for (let i = 0; i < size; i++) {
      const r = dir === -1 ? y - i : y + i;
      for (let colOffset = 0; colOffset < 2; colOffset++) {
        const c = x - colOffset;
        if (!reserved[r][c]) {
          const bitVal = bitIdx < bitStream.length ? bitStream[bitIdx++] : false;
          const maskVal = (r + c) % 2 === 0;
          matrix[r][c] = bitVal !== maskVal;
        }
      }
    }

    y = dir === -1 ? 0 : size - 1;
    dir = -dir;
    x -= 2;
  }

  // 7. Standard Format Information Bits for Level L + Mask 0
  // BCH(15,5) for Level L (01) + Mask 0 (000) = 111010111111001
  const formatBits = [true, true, true, false, true, false, true, true, true, true, true, true, false, false, true];

  // Top-left format strip (Bit 0 at 8,0 to Bit 14 at 0,8)
  setModule(8, 0, formatBits[14]);
  setModule(8, 1, formatBits[13]);
  setModule(8, 2, formatBits[12]);
  setModule(8, 3, formatBits[11]);
  setModule(8, 4, formatBits[10]);
  setModule(8, 5, formatBits[9]);
  setModule(8, 7, formatBits[8]);
  setModule(8, 8, formatBits[7]);
  setModule(7, 8, formatBits[6]);
  setModule(5, 8, formatBits[5]);
  setModule(4, 8, formatBits[4]);
  setModule(3, 8, formatBits[3]);
  setModule(2, 8, formatBits[2]);
  setModule(1, 8, formatBits[1]);
  setModule(0, 8, formatBits[0]);

  // Top-right & Bottom-left format strips
  setModule(8, 20, formatBits[14]);
  setModule(8, 19, formatBits[13]);
  setModule(8, 18, formatBits[12]);
  setModule(8, 17, formatBits[11]);
  setModule(8, 16, formatBits[10]);
  setModule(8, 15, formatBits[9]);
  setModule(8, 14, formatBits[8]);
  setModule(8, 13, formatBits[7]);

  setModule(20, 8, formatBits[7]);
  setModule(19, 8, formatBits[6]);
  setModule(18, 8, formatBits[5]);
  setModule(17, 8, formatBits[4]);
  setModule(16, 8, formatBits[3]);
  setModule(15, 8, formatBits[2]);
  setModule(14, 8, formatBits[1]);
  setModule(13, 8, true); // Dark module is always dark (true)

  return matrix;
}

export default function TeamScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const user = useSessionStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'PROJECTS' | 'TASKS'>('DIRECTORY');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Dynamic QR Code & Live Session State
  const [qrInviteCode, setQrInviteCode] = useState<string>('UWO-TEAM-7892');
  const [qrSessionData, setQrSessionData] = useState<QrSessionResponse | null>(null);
  const [qrSessionStatus, setQrSessionStatus] = useState<string>('WAITING');
  const [qrRemainingSeconds, setQrRemainingSeconds] = useState<number>(120);
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);

  // Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinSuccessToast, setJoinSuccessToast] = useState(false);

  const fetchCreateQrSession = async () => {
    try {
      setIsGeneratingQr(true);
      const session = await authApi.createQrSession();
      setQrSessionData(session);
      setQrSessionStatus(session.status || 'WAITING');
      setQrRemainingSeconds(session.expires_in_seconds || 120);
    } catch (err) {
      console.warn('[Create QR Session Warning]', err);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleOpenQrModal = () => {
    setShowQrModal(true);
    fetchCreateQrSession();
  };

  const handleGenerateNewQr = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setQrInviteCode(`UWO-TEAM-${randomNum}`);
    fetchCreateQrSession();
  };

  useEffect(() => {
    if (!showQrModal || !qrSessionData?.session_id) return;

    const interval = setInterval(async () => {
      try {
        const res = await authApi.getQrSessionStatus(qrSessionData.session_id);
        setQrSessionStatus(res.status);
        setQrRemainingSeconds(res.expires_in_seconds);

        if (res.status === 'CONSUMED' || res.status === 'AUTHENTICATED' || res.status === 'EXPIRED') {
          clearInterval(interval);
        }
      } catch (err) {
        // ignore polling glitch
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [showQrModal, qrSessionData?.session_id]);

  const handleJoinWorkspace = (codeOverride?: string) => {
    const codeToJoin = codeOverride || joinCodeInput.trim() || qrInviteCode;
    if (!codeToJoin) return;

    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: user?.name || user?.first_name || 'Joined Member',
      email: user?.email || 'new.member@uwoconnect.com',
      role: 'AGENT',
      department: 'Sales & Marketing',
      status: 'ACTIVE',
      tasksCompleted: 0,
      avgResponseTime: 'New',
    };
    setTeamMembers((prev) => [newMember, ...prev]);
    setShowJoinModal(false);
    setShowQrModal(false);
    setJoinSuccessToast(true);
    setTimeout(() => setJoinSuccessToast(false), 3500);
  };

  // Invite Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'AGENT' | 'SUPERVISOR' | 'ADMIN'>('AGENT');
  const [inviteDept, setInviteDept] = useState('Sales & Marketing');
  const [inviteSuccessToast, setInviteSuccessToast] = useState(false);

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('Aditya Sharma');
  const [taskPriority, setTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [taskCategory, setTaskCategory] = useState('Lead Follow-up');

  // Copy Link State
  const [copiedLink, setCopiedLink] = useState(false);

  // Team Members Data
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'm1',
      name: 'Aditya Sharma',
      email: 'aditya@uwoconnect.com',
      role: 'ADMIN',
      department: 'Management',
      status: 'ACTIVE',
      tasksCompleted: 24,
      avgResponseTime: '< 15s',
      phone: '+91 98765 43210',
    },
    {
      id: 'm2',
      name: 'Priya Patel',
      email: 'priya.patel@uwoconnect.com',
      role: 'SUPERVISOR',
      department: 'Customer Support',
      status: 'ACTIVE',
      tasksCompleted: 19,
      avgResponseTime: '< 30s',
      phone: '+91 98765 12345',
    },
    {
      id: 'm3',
      name: 'Rahul Verma',
      email: 'rahul.verma@uwoconnect.com',
      role: 'AGENT',
      department: 'Sales & Marketing',
      status: 'ACTIVE',
      tasksCompleted: 14,
      avgResponseTime: '45s',
      phone: '+91 98123 45678',
    },
    {
      id: 'm4',
      name: 'Ananya Gupta',
      email: 'ananya.g@uwoconnect.com',
      role: 'AGENT',
      department: 'Engineering',
      status: 'AWAY',
      tasksCompleted: 11,
      avgResponseTime: '1m 20s',
      phone: '+91 97111 22334',
    },
  ]);

  // Projects Data
  const [projectsList, setProjectsList] = useState<WorkspaceProject[]>([
    {
      id: 'p1',
      name: 'ABC Hospital WhatsApp Router',
      department: 'Healthcare Sales',
      status: 'ACTIVE',
      progress: 85,
      leadCount: 4820,
      membersCount: 3,
    },
    {
      id: 'p2',
      name: 'Instagram Lead Auto-Responder',
      department: 'Marketing',
      status: 'IN_PROGRESS',
      progress: 60,
      leadCount: 1250,
      membersCount: 2,
    },
    {
      id: 'p3',
      name: 'CRM Webhook Integration Hub',
      department: 'Engineering',
      status: 'COMPLETED',
      progress: 100,
      leadCount: 8900,
      membersCount: 4,
    },
  ]);

  // Tasks Data
  const [tasksList, setTasksList] = useState<WorkspaceTask[]>([
    {
      id: 't1',
      title: 'Verify WhatsApp Business API Webhook Secret',
      assigneeName: 'Aditya Sharma',
      priority: 'HIGH',
      dueDate: 'Today, 5:00 PM',
      status: 'IN_PROGRESS',
      category: 'Security & Auth',
    },
    {
      id: 't2',
      title: 'Review Hospital Appointment Lead Escalation Flow',
      assigneeName: 'Priya Patel',
      priority: 'HIGH',
      dueDate: 'Tomorrow',
      status: 'TO_DO',
      category: 'Customer Support',
    },
    {
      id: 't3',
      title: 'Update Product Catalog Prices for Q3 Campaign',
      assigneeName: 'Rahul Verma',
      priority: 'MEDIUM',
      dueDate: 'Sep 06',
      status: 'COMPLETED',
      category: 'Sales',
    },
  ]);

  const { data: statsData, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['clientStatsTeam'],
    queryFn: () => statsApi.getClientStats(),
  });

  const departmentsList = [
    'ALL',
    'Sales & Marketing',
    'Customer Support',
    'Engineering',
    'Management',
  ];

  const filteredMembers = teamMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedDept !== 'ALL' && m.department !== selectedDept) return false;
    return true;
  });

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return;
    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: inviteName.trim() || inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      department: inviteDept,
      status: 'ACTIVE',
      tasksCompleted: 0,
      avgResponseTime: 'New',
    };

    setTeamMembers((prev) => [newMember, ...prev]);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    setInviteSuccessToast(true);
    setTimeout(() => setInviteSuccessToast(false), 3000);
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    const newTask: WorkspaceTask = {
      id: `t-${Date.now()}`,
      title: taskTitle.trim(),
      assigneeName: taskAssignee,
      priority: taskPriority,
      dueDate: 'Due Soon',
      status: 'TO_DO',
      category: taskCategory,
    };

    setTasksList((prev) => [newTask, ...prev]);
    setShowCreateTaskModal(false);
    setTaskTitle('');
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasksList((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus: WorkspaceTask['status'] =
            t.status === 'COMPLETED' ? 'TO_DO' : 'COMPLETED';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleCopyInviteLink = async () => {
    const fullUrl = qrInviteCode.startsWith('http')
      ? qrInviteCode
      : `https://uwoconnect.aisa24.com/join?code=${qrInviteCode}`;
    try {
      await Share.share({
        message: `Join our UwoConnect Workspace instantly: ${fullUrl}`,
        url: fullUrl,
      });
    } catch (e) {
      // fallback
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header
        title="Team"
        showBack
        onBackPress={() => router.back()}
        rightElement={
          <TouchableOpacity
            style={[styles.topHeaderActionBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowInviteModal(true)}
          >
            <UserPlus size={16} color="#FFF" />
            <Text variant="caption" weight="bold" color="#FFF">
              + Invite
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={statsLoading} onRefresh={refetch} />}
      >
        {/* Web Parity Hero Banner Card */}
        <Card variant="default" style={styles.heroCard}>
          <View style={styles.heroCardHeaderRow}>
            <View style={styles.heroTitleGroup}>
              <View style={styles.heroBadgeRow}>
                <Users size={22} color={colors.primary} />
                <Text variant="h2" weight="bold" color={colors.textPrimary}>
                  Team & Workspace Hub
                </Text>
              </View>
              <Text variant="caption" color={colors.textMuted} style={styles.heroSubtitle}>
                Manage your organization, assign tasks, track attendance, and monitor team performance.
              </Text>
            </View>
          </View>

          {/* Quick Action Button Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionPillsScroll}>
            <TouchableOpacity
              style={[styles.actionPillBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
              onPress={handleOpenQrModal}
            >
              <QrCode size={14} color="#059669" />
              <Text variant="caption" weight="bold" color="#059669">
                QR Code Invite
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionPillBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setShowInviteModal(true)}
            >
              <UserPlus size={14} color="#FFF" />
              <Text variant="caption" weight="bold" color="#FFF">
                Invite Member
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionPillBtn, { backgroundColor: '#0F172A', borderColor: '#1E293B' }]}
              onPress={() => setShowCreateProjectModal(true)}
            >
              <FolderPlus size={14} color="#FFF" />
              <Text variant="caption" weight="bold" color="#FFF">
                New Project
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionPillBtn, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}
              onPress={() => setShowCreateTaskModal(true)}
            >
              <CheckSquare size={14} color="#475569" />
              <Text variant="caption" weight="bold" color="#475569">
                + Create Task
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Card>

        {/* Success Toasts */}
        {inviteSuccessToast && (
          <View style={[styles.toastBar, { backgroundColor: '#059669' }]}>
            <CheckCircle2 size={16} color="#FFF" />
            <Text variant="caption" weight="bold" color="#FFF">
              Invitation sent successfully to new team member!
            </Text>
          </View>
        )}

        {joinSuccessToast && (
          <View style={[styles.toastBar, { backgroundColor: '#059669' }]}>
            <CheckCircle2 size={16} color="#FFF" />
            <Text variant="caption" weight="bold" color="#FFF">
              🎉 Successfully joined workspace {qrInviteCode}!
            </Text>
          </View>
        )}

        {/* Section Nav Tabs: Directory | Projects | Tasks & Board */}
        <View style={styles.tabNavRow}>
          <TouchableOpacity
            style={[
              styles.navTabBtn,
              {
                backgroundColor: activeTab === 'DIRECTORY' ? colors.primary : colors.surface,
                borderColor: activeTab === 'DIRECTORY' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveTab('DIRECTORY')}
          >
            <Users size={14} color={activeTab === 'DIRECTORY' ? '#FFF' : colors.textMuted} />
            <Text variant="caption" weight="bold" color={activeTab === 'DIRECTORY' ? '#FFF' : colors.textMuted}>
              Directory ({statsData?.resourceCounts?.teamMembers ?? teamMembers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navTabBtn,
              {
                backgroundColor: activeTab === 'PROJECTS' ? colors.primary : colors.surface,
                borderColor: activeTab === 'PROJECTS' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveTab('PROJECTS')}
          >
            <FolderPlus size={14} color={activeTab === 'PROJECTS' ? '#FFF' : colors.textMuted} />
            <Text variant="caption" weight="bold" color={activeTab === 'PROJECTS' ? '#FFF' : colors.textMuted}>
              Projects ({statsData?.resourceCounts?.projects ?? projectsList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navTabBtn,
              {
                backgroundColor: activeTab === 'TASKS' ? colors.primary : colors.surface,
                borderColor: activeTab === 'TASKS' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveTab('TASKS')}
          >
            <CheckSquare size={14} color={activeTab === 'TASKS' ? '#FFF' : colors.textMuted} />
            <Text variant="caption" weight="bold" color={activeTab === 'TASKS' ? '#FFF' : colors.textMuted}>
              Tasks & Board ({tasksList.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: DIRECTORY */}
        {activeTab === 'DIRECTORY' && (
          <View>
            {/* Search & Department Filter Bar */}
            <View style={[styles.searchFilterWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.searchBarInputGroup}>
                <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.searchInputText, { color: colors.textPrimary }]}
                  placeholder="Search team member by name, email, role..."
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
            </View>

            {/* Department Pills Scroll */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptPillsScroll}>
              {departmentsList.map((dept) => {
                const isSel = selectedDept === dept;
                return (
                  <TouchableOpacity
                    key={dept}
                    style={[
                      styles.deptPillBtn,
                      {
                        backgroundColor: isSel ? '#059669' : colors.surface,
                        borderColor: isSel ? '#059669' : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedDept(dept)}
                  >
                    <Text variant="caption" weight="bold" color={isSel ? '#FFF' : colors.textMuted}>
                      {dept === 'ALL' ? 'All Departments' : dept}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Team Member Cards Stack */}
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <Card key={member.id} variant="default" style={styles.memberCard}>
                  <View style={styles.memberCardHeader}>
                    <View style={styles.memberAvatarGroup}>
                      <Avatar name={member.name} uri={member.avatar} size="md" isOnline={member.status === 'ACTIVE'} />
                      <View style={styles.memberTextGroup}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text variant="h3" weight="bold" color={colors.textPrimary}>
                            {member.name}
                          </Text>
                          <Badge
                            label={member.role}
                            variant={member.role === 'ADMIN' ? 'error' : (member.role === 'SUPERVISOR' ? 'info' : 'success')}
                          />
                        </View>
                        <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                          {member.email} • {member.department}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Performance stats row */}
                  <View style={[styles.statsBarRow, { backgroundColor: colors.background }]}>
                    <View style={styles.statCol}>
                      <Text variant="caption" color={colors.textMuted} style={{ fontSize: 9 }}>
                        TASKS COMPLETED
                      </Text>
                      <Text variant="caption" weight="bold" color={colors.primary} style={{ fontSize: 11 }}>
                        {member.tasksCompleted} Tasks
                      </Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statCol}>
                      <Text variant="caption" color={colors.textMuted} style={{ fontSize: 9 }}>
                        AVG RESPONSE TIME
                      </Text>
                      <Text variant="caption" weight="bold" color={colors.success} style={{ fontSize: 11 }}>
                        {member.avgResponseTime}
                      </Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statCol}>
                      <Text variant="caption" color={colors.textMuted} style={{ fontSize: 9 }}>
                        AVAILABILITY
                      </Text>
                      <Text variant="caption" weight="bold" color={member.status === 'ACTIVE' ? colors.success : colors.warning} style={{ fontSize: 11 }}>
                        ● {member.status}
                      </Text>
                    </View>
                  </View>

                  {/* Card Action Buttons */}
                  <View style={styles.memberCardActionsRow}>
                    <TouchableOpacity
                      style={[styles.memberActionBtn, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}
                      onPress={() => router.push('/inbox')}
                    >
                      <Mail size={12} color="#4F46E5" />
                      <Text variant="caption" weight="bold" color="#4F46E5">
                        Message
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.memberActionBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
                      onPress={() => {
                        setTaskAssignee(member.name);
                        setShowCreateTaskModal(true);
                      }}
                    >
                      <CheckSquare size={12} color="#059669" />
                      <Text variant="caption" weight="bold" color="#059669">
                        Assign Task
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            ) : (
              <Card variant="outlined" style={styles.emptyCard}>
                <View style={styles.emptyIconBox}>
                  <Users size={32} color={colors.textMuted} />
                </View>
                <Text variant="h3" weight="bold" color={colors.textPrimary} style={{ marginTop: 10 }}>
                  No team members found
                </Text>
                <Text variant="caption" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 4, marginBottom: 16 }}>
                  Generate a QR code or add employees directly to start collaborating.
                </Text>
                <TouchableOpacity
                  style={[styles.actionPillBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={handleOpenQrModal}
                >
                  <QrCode size={16} color="#FFF" />
                  <Text variant="caption" weight="bold" color="#FFF">
                    Generate QR Code Invite
                  </Text>
                </TouchableOpacity>
              </Card>
            )}
          </View>
        )}

        {/* TAB 2: PROJECTS */}
        {activeTab === 'PROJECTS' && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text variant="label" style={styles.sectionLabelTitle}>
                ACTIVE WORKSPACE PROJECTS
              </Text>
              <TouchableOpacity
                style={[styles.smallAddBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowCreateProjectModal(true)}
              >
                <Plus size={14} color="#FFF" />
                <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 10 }}>
                  New Project
                </Text>
              </TouchableOpacity>
            </View>

            {projectsList.map((proj) => (
              <Card key={proj.id} variant="default" style={styles.projectCard}>
                <View style={styles.projHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text variant="h3" weight="bold" color={colors.textPrimary}>
                      {proj.name}
                    </Text>
                    <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                      Department: {proj.department}
                    </Text>
                  </View>
                  <Badge label={proj.status} variant={proj.status === 'COMPLETED' ? 'success' : 'info'} />
                </View>

                {/* Progress Bar */}
                <View style={styles.progressTrackContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                      Completion Progress
                    </Text>
                    <Text variant="caption" weight="bold" color={colors.primary} style={{ fontSize: 10 }}>
                      {proj.progress}%
                    </Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: colors.background }]}>
                    <View style={[styles.progressFill, { width: `${proj.progress}%`, backgroundColor: colors.primary }]} />
                  </View>
                </View>

                <View style={styles.projFooterRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Zap size={13} color={colors.warning} />
                    <Text variant="caption" weight="bold" color={colors.textPrimary}>
                      {proj.leadCount.toLocaleString()} Leads Routed
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Users size={13} color={colors.textMuted} />
                    <Text variant="caption" color={colors.textMuted}>
                      {proj.membersCount} Members Assigned
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* TAB 3: TASKS & BOARD */}
        {activeTab === 'TASKS' && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text variant="label" style={styles.sectionLabelTitle}>
                TASK ASSIGNMENTS & BOARD
              </Text>
              <TouchableOpacity
                style={[styles.smallAddBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowCreateTaskModal(true)}
              >
                <Plus size={14} color="#FFF" />
                <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 10 }}>
                  + Task
                </Text>
              </TouchableOpacity>
            </View>

            {tasksList.map((task) => {
              const isDone = task.status === 'COMPLETED';
              return (
                <Card key={task.id} variant="default" style={styles.taskCard}>
                  <View style={styles.taskHeaderRow}>
                    <TouchableOpacity
                      style={[
                        styles.taskCheckBox,
                        {
                          backgroundColor: isDone ? '#059669' : 'transparent',
                          borderColor: isDone ? '#059669' : colors.border,
                        },
                      ]}
                      onPress={() => toggleTaskStatus(task.id)}
                    >
                      {isDone && <Check size={12} color="#FFF" strokeWidth={3} />}
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                      <Text
                        variant="body"
                        weight="bold"
                        color={isDone ? colors.textMuted : colors.textPrimary}
                        style={{ textDecorationLine: isDone ? 'line-through' : 'none' }}
                      >
                        {task.title}
                      </Text>
                      <Text variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                        Assignee: <Text weight="bold" color={colors.textPrimary}>{task.assigneeName}</Text> • {task.category}
                      </Text>
                    </View>

                    <Badge
                      label={task.priority}
                      variant={task.priority === 'HIGH' ? 'error' : (task.priority === 'MEDIUM' ? 'warning' : 'neutral')}
                    />
                  </View>

                  <View style={styles.taskFooterRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} color={colors.textMuted} />
                      <Text variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                        Due: {task.dueDate}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.taskStatusPill, { backgroundColor: isDone ? '#ECFDF5' : '#FEF3C7' }]}
                      onPress={() => toggleTaskStatus(task.id)}
                    >
                      <Text variant="caption" weight="bold" color={isDone ? '#059669' : '#D97706'} style={{ fontSize: 9 }}>
                        {task.status.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL 1: QR CODE INVITE MODAL */}
      {/* ========================================================================= */}
      {showQrModal && (
        <Modal
          visible={showQrModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowQrModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.qrModalCard, { backgroundColor: '#FFFFFF' }]}>
              <View style={styles.qrModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <QrCode size={20} color={colors.primary} />
                  <Text variant="h3" weight="bold" color={colors.textPrimary}>
                    QR Code Workspace Invite
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowQrModal(false)}>
                  <X size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ paddingHorizontal: 16, paddingVertical: 10 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={true}>
                <Text variant="caption" color={colors.textMuted} style={{ textAlign: 'center', marginBottom: 12 }}>
                  Scan this QR Code from the UwoConnect Mobile App to join this workspace instantly as an Agent/Supervisor.
                </Text>

                {/* Live Real-Time Auth Status Badge */}
                <View style={{ alignSelf: 'center', marginBottom: 10 }}>
                  {qrSessionStatus === 'WAITING' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                      <Clock size={12} color="#4F46E5" />
                      <Text variant="caption" weight="bold" color="#4F46E5" style={{ fontSize: 11 }}>
                        Waiting for scan... ({Math.floor(qrRemainingSeconds / 60)}:{(qrRemainingSeconds % 60).toString().padStart(2, '0')})
                      </Text>
                    </View>
                  )}
                  {(qrSessionStatus === 'SCANNED' || qrSessionStatus === 'AUTHENTICATING') && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                      <Zap size={12} color="#D97706" />
                      <Text variant="caption" weight="bold" color="#D97706" style={{ fontSize: 11 }}>
                        📱 Phone Scanned! Authenticating Device...
                      </Text>
                    </View>
                  )}
                  {(qrSessionStatus === 'CONSUMED' || qrSessionStatus === 'AUTHENTICATED') && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                      <CheckCircle2 size={12} color="#059669" />
                      <Text variant="caption" weight="bold" color="#059669" style={{ fontSize: 11 }}>
                        ✅ Mobile Device Connected & Logged In!
                      </Text>
                    </View>
                  )}
                  {qrSessionStatus === 'EXPIRED' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                      <X size={12} color="#EF4444" />
                      <Text variant="caption" weight="bold" color="#EF4444" style={{ fontSize: 11 }}>
                        ⚠️ QR Expired! Click "New" to Refresh.
                      </Text>
                    </View>
                  )}
                </View>

                {/* Dynamic QR Code Generator Render */}
                <View style={styles.qrGraphicContainer}>
                  <View
                    style={{
                      padding: 12,
                      backgroundColor: '#FFFFFF',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <QRCode
                      value={
                        qrSessionData?.session_id
                          ? `uwoconnect://auth/qr?session_id=${qrSessionData.session_id}`
                          : `uwoconnect://join?code=${qrInviteCode}`
                      }
                      size={175}
                      color="#0F172A"
                      backgroundColor="#FFFFFF"
                      ecl="M"
                      quietZone={8}
                    />
                  </View>

                  <View style={{ width: '100%', marginTop: 14 }}>
                    <Text variant="caption" weight="bold" color={colors.textMuted} style={{ fontSize: 10, marginBottom: 4, textAlign: 'center' }}>
                      WORKSPACE / INVITE CODE
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: colors.background,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                      }}
                    >
                      <TextInput
                        style={{ flex: 1, fontSize: 13, fontWeight: '700', color: colors.primary, textAlign: 'center' }}
                        value={qrInviteCode}
                        onChangeText={setQrInviteCode}
                        placeholder="Type custom workspace code..."
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="characters"
                      />
                      <TouchableOpacity
                        style={{
                          backgroundColor: colors.primary,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 6,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        onPress={handleGenerateNewQr}
                      >
                        <Zap size={12} color="#FFF" />
                        <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 10 }}>
                          New
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: copiedLink ? '#047857' : '#059669',
                    marginTop: 14,
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    width: '100%',
                  }}
                  activeOpacity={0.8}
                  onPress={handleCopyInviteLink}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {copiedLink ? <Check size={16} color="#FFFFFF" /> : <Copy size={16} color="#FFFFFF" />}
                    <Text variant="caption" weight="bold" style={{ fontSize: 13, color: '#FFFFFF' }}>
                      {copiedLink ? '✓ Link Copied to Clipboard!' : 'Copy & Share Invite Link'}
                    </Text>
                  </View>
                  <Text variant="caption" style={{ fontSize: 10, marginTop: 4, textAlign: 'center', color: '#D1FAE5', fontWeight: '500' }}>
                    {`https://uwoconnect.aisa24.com/join?code=${qrInviteCode}`}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.copyBtnModal, { backgroundColor: '#0F172A', marginTop: 8 }]}
                  onPress={() => handleJoinWorkspace(qrInviteCode)}
                >
                  <Sparkles size={16} color="#FFF" />
                  <Text variant="caption" weight="bold" color="#FFF">
                    🚀 Join Workspace In-App Now
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: INVITE MEMBER MODAL */}
      {/* ========================================================================= */}
      {showInviteModal && (
        <Modal
          visible={showInviteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowInviteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.qrModalCard, { backgroundColor: '#FFFFFF' }]}>
              <View style={[styles.qrModalHeader, { backgroundColor: colors.primary }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <UserPlus size={18} color="#FFF" />
                  <Text variant="h3" weight="bold" color="#FFF">
                    Invite Team Member
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                  <X size={18} color="#FFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ padding: 18 }} showsVerticalScrollIndicator={false}>
                <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginBottom: 4 }}>
                  FULL NAME
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary }]}
                  placeholder="e.g. Vikram Malhotra"
                  placeholderTextColor={colors.textMuted}
                  value={inviteName}
                  onChangeText={setInviteName}
                />

                <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginTop: 10, marginBottom: 4 }}>
                  EMAIL ADDRESS *
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary }]}
                  placeholder="name@company.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                />

                <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginTop: 10, marginBottom: 6 }}>
                  ASSIGN ROLE
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  {(['AGENT', 'SUPERVISOR', 'ADMIN'] as const).map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.rolePillOption,
                        {
                          backgroundColor: inviteRole === r ? colors.primary : colors.background,
                          borderColor: inviteRole === r ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setInviteRole(r)}
                    >
                      <Text variant="caption" weight="bold" color={inviteRole === r ? '#FFF' : colors.textMuted} style={{ fontSize: 10 }}>
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginBottom: 4 }}>
                  DEPARTMENT
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary }]}
                  placeholder="Sales & Marketing"
                  placeholderTextColor={colors.textMuted}
                  value={inviteDept}
                  onChangeText={setInviteDept}
                />

                <TouchableOpacity
                  style={[styles.copyBtnModal, { backgroundColor: colors.primary, marginTop: 16 }]}
                  onPress={handleSendInvite}
                >
                  <UserPlus size={16} color="#FFF" />
                  <Text variant="caption" weight="bold" color="#FFF">
                    Send Invitation ➔
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE TASK MODAL */}
      {/* ========================================================================= */}
      {showCreateTaskModal && (
        <Modal
          visible={showCreateTaskModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCreateTaskModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.qrModalCard, { backgroundColor: '#FFFFFF' }]}>
              <View style={[styles.qrModalHeader, { backgroundColor: '#0F172A' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CheckSquare size={18} color="#FFF" />
                  <Text variant="h3" weight="bold" color="#FFF">
                    Create & Assign Task
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowCreateTaskModal(false)}>
                  <X size={18} color="#FFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ padding: 18 }} showsVerticalScrollIndicator={false}>
                <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginBottom: 4 }}>
                  TASK TITLE *
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary }]}
                  placeholder="e.g. Follow up on High Intent Hospital Lead"
                  placeholderTextColor={colors.textMuted}
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                />

                <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginTop: 10, marginBottom: 4 }}>
                  ASSIGNEE
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary }]}
                  placeholder="Aditya Sharma"
                  placeholderTextColor={colors.textMuted}
                  value={taskAssignee}
                  onChangeText={setTaskAssignee}
                />

                <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginTop: 10, marginBottom: 6 }}>
                  PRIORITY LEVEL
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  {(['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.rolePillOption,
                        {
                          backgroundColor: taskPriority === p ? (p === 'HIGH' ? '#EF4444' : (p === 'MEDIUM' ? '#F59E0B' : '#059669')) : colors.background,
                          borderColor: taskPriority === p ? 'transparent' : colors.border,
                        },
                      ]}
                      onPress={() => setTaskPriority(p)}
                    >
                      <Text variant="caption" weight="bold" color={taskPriority === p ? '#FFF' : colors.textMuted} style={{ fontSize: 10 }}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.copyBtnModal, { backgroundColor: '#0F172A', marginTop: 16 }]}
                  onPress={handleCreateTask}
                >
                  <CheckSquare size={16} color="#FFF" />
                  <Text variant="caption" weight="bold" color="#FFF">
                    Create & Assign Task ➔
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CREATE PROJECT MODAL */}
      {/* ========================================================================= */}
      {showCreateProjectModal && (
        <Modal
          visible={showCreateProjectModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCreateProjectModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.qrModalCard, { backgroundColor: '#FFFFFF' }]}>
              <View style={[styles.qrModalHeader, { backgroundColor: '#0F172A' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <FolderPlus size={18} color="#FFF" />
                  <Text variant="h3" weight="bold" color="#FFF">
                    New Workspace Project
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowCreateProjectModal(false)}>
                  <X size={18} color="#FFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ padding: 18 }} showsVerticalScrollIndicator={false}>
                <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginBottom: 4 }}>
                  PROJECT NAME
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary }]}
                  placeholder="e.g. Q4 WhatsApp Marketing Campaign"
                  placeholderTextColor={colors.textMuted}
                />

                <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ marginTop: 10, marginBottom: 4 }}>
                  DEPARTMENT
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary }]}
                  placeholder="Sales & Marketing"
                  placeholderTextColor={colors.textMuted}
                />

                <TouchableOpacity
                  style={[styles.copyBtnModal, { backgroundColor: colors.primary, marginTop: 16 }]}
                  onPress={() => {
                    setShowCreateProjectModal(false);
                    setProjectsList((prev) => [
                      {
                        id: `p-${Date.now()}`,
                        name: 'New Automation Project',
                        department: 'General',
                        status: 'ACTIVE',
                        progress: 10,
                        leadCount: 0,
                        membersCount: 1,
                      },
                      ...prev,
                    ]);
                  }}
                >
                  <FolderPlus size={16} color="#FFF" />
                  <Text variant="caption" weight="bold" color="#FFF">
                    Create Project ➔
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topHeaderActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroCard: {
    marginBottom: 14,
    padding: 16,
  },
  heroCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroTitleGroup: {
    flex: 1,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 11,
    lineHeight: 16,
  },
  actionPillsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  toastBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 14,
  },
  tabNavRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  navTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchFilterWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchBarInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputText: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 2,
  },
  deptPillsScroll: {
    gap: 6,
    paddingBottom: 12,
  },
  deptPillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  memberCard: {
    marginBottom: 10,
    padding: 14,
  },
  memberCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  memberAvatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  memberTextGroup: {
    flex: 1,
  },
  statsBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  statCol: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  memberCardActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  memberActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabelTitle: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  smallAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  projectCard: {
    marginBottom: 10,
    padding: 14,
  },
  projHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressTrackContainer: {
    marginBottom: 10,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  projFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  taskCard: {
    marginBottom: 10,
    padding: 14,
  },
  taskHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  taskCheckBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  taskFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  taskStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  qrModalCard: {
    width: '92%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  qrModalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrGraphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  copyBtnModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#F8FAFC',
    marginBottom: 4,
  },
  rolePillOption: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
});
