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
  const { colors, mode } = useTheme();
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
        showMenu={true}
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
                <View style={[styles.heroIconBox, { backgroundColor: colors.primary + '18' }]}>
                  <Users size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="h3" weight="bold" color={colors.textPrimary}>
                    Team & Workspace Hub
                  </Text>
                  <Text variant="caption" color={colors.textMuted} style={styles.heroSubtitle}>
                    Manage your organization, assign tasks, and monitor performance.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Action Button Grid */}
          <View style={styles.quickActionsContainer}>
            <View style={styles.actionGridRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.quickActionBtn, styles.quickActionPrimary, { backgroundColor: colors.primary }]}
                onPress={() => setShowInviteModal(true)}
              >
                <UserPlus size={15} color="#FFF" />
                <Text variant="caption" weight="bold" color="#FFF" style={styles.actionBtnText}>
                  Invite Member
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.quickActionBtn,
                  {
                    backgroundColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.14)' : '#ECFDF5',
                    borderColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.28)' : '#A7F3D0',
                  },
                ]}
                onPress={handleOpenQrModal}
              >
                <QrCode size={15} color={colors.primary} />
                <Text variant="caption" weight="bold" color={colors.primary} style={styles.actionBtnText}>
                  QR Code Invite
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionGridRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.quickActionBtn,
                  {
                    backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                  },
                ]}
                onPress={() => setShowCreateProjectModal(true)}
              >
                <FolderPlus size={15} color={colors.textPrimary} />
                <Text variant="caption" weight="bold" color={colors.textPrimary} style={styles.actionBtnText}>
                  New Project
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.quickActionBtn,
                  {
                    backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                  },
                ]}
                onPress={() => setShowCreateTaskModal(true)}
              >
                <CheckSquare size={15} color={colors.textPrimary} />
                <Text variant="caption" weight="bold" color={colors.textPrimary} style={styles.actionBtnText}>
                  Create Task
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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

        {/* Section Nav Tabs: Directory | Projects | Tasks */}
        <View
          style={[
            styles.tabSegmentContainer,
            {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            },
          ]}
        >
          {[
            {
              id: 'DIRECTORY' as const,
              label: 'Directory',
              count: statsData?.resourceCounts?.teamMembers ?? teamMembers.length,
              icon: Users,
            },
            {
              id: 'PROJECTS' as const,
              label: 'Projects',
              count: statsData?.resourceCounts?.projects ?? projectsList.length,
              icon: FolderPlus,
            },
            {
              id: 'TASKS' as const,
              label: 'Tasks',
              count: tasksList.length,
              icon: CheckSquare,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.75}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tabSegmentItem,
                  isActive && [
                    styles.tabSegmentItemActive,
                    {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                    },
                  ],
                ]}
              >
                <Icon
                  size={14}
                  color={isActive ? '#FFF' : colors.textMuted}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <Text
                  variant="caption"
                  weight={isActive ? 'bold' : 'medium'}
                  color={isActive ? '#FFF' : colors.textMuted}
                  style={styles.tabLabel}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.tabBadgePill,
                    {
                      backgroundColor: isActive
                        ? 'rgba(255, 255, 255, 0.25)'
                        : mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.06)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      {
                        color: isActive ? '#FFF' : colors.textMuted,
                        fontWeight: isActive ? '700' : '600',
                      },
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
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

                  {/* Clean lightweight performance metrics */}
                  <View style={styles.memberMetricsRow}>
                    <View
                      style={[
                        styles.metricChip,
                        {
                          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
                          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                        },
                      ]}
                    >
                      <CheckSquare size={12} color={colors.primary} />
                      <Text variant="caption" weight="bold" color={colors.textPrimary} style={{ fontSize: 11 }}>
                        {member.tasksCompleted} Tasks Done
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.metricChip,
                        {
                          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
                          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                        },
                      ]}
                    >
                      <Clock size={12} color="#0284C7" />
                      <Text variant="caption" weight="medium" color={colors.textSecondary} style={{ fontSize: 11 }}>
                        Avg: <Text weight="bold" color={colors.textPrimary}>{member.avgResponseTime}</Text>
                      </Text>
                    </View>
                  </View>

                  {/* Card Action Buttons */}
                  <View style={styles.memberCardActionsRow}>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      style={[
                        styles.memberActionBtn,
                        {
                          backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.12)' : '#EEF2FF',
                          borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.25)' : '#E0E7FF',
                        },
                      ]}
                      onPress={() => router.push('/inbox')}
                    >
                      <Mail size={13} color="#4F46E5" />
                      <Text variant="caption" weight="bold" color="#4F46E5" style={{ fontSize: 12 }}>
                        Message
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.75}
                      style={[
                        styles.memberActionBtn,
                        {
                          backgroundColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
                          borderColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.25)' : '#D1FAE5',
                        },
                      ]}
                      onPress={() => {
                        setTaskAssignee(member.name);
                        setShowCreateTaskModal(true);
                      }}
                    >
                      <Plus size={13} color={colors.primary} />
                      <Text variant="caption" weight="bold" color={colors.primary} style={{ fontSize: 12 }}>
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
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowQrModal(false)}
            />
            <View style={styles.modernModalCard}>
              <View style={styles.modernModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.modalIconBadge, { backgroundColor: '#ECFDF5' }]}>
                    <QrCode size={20} color="#059669" />
                  </View>
                  <View>
                    <Text variant="h3" weight="bold" color="#0F172A">
                      QR Workspace Invite
                    </Text>
                    <Text variant="caption" color="#64748B" style={{ fontSize: 12, marginTop: 1 }}>
                      Instant member onboarding scan
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseCircle}
                  onPress={() => setShowQrModal(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text variant="caption" color="#64748B" style={{ textAlign: 'center', marginBottom: 14, fontSize: 12, lineHeight: 18 }}>
                  Scan this QR Code from the UwoConnect Mobile App to join this workspace instantly as an Agent/Supervisor.
                </Text>

                {/* Live Real-Time Auth Status Badge */}
                <View style={{ alignSelf: 'center', marginBottom: 12 }}>
                  {qrSessionStatus === 'WAITING' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                      <Clock size={13} color="#4F46E5" />
                      <Text variant="caption" weight="bold" color="#4F46E5" style={{ fontSize: 11 }}>
                        Waiting for scan... ({Math.floor(qrRemainingSeconds / 60)}:{(qrRemainingSeconds % 60).toString().padStart(2, '0')})
                      </Text>
                    </View>
                  )}
                  {(qrSessionStatus === 'SCANNED' || qrSessionStatus === 'AUTHENTICATING') && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                      <Zap size={13} color="#D97706" />
                      <Text variant="caption" weight="bold" color="#D97706" style={{ fontSize: 11 }}>
                        📱 Phone Scanned! Authenticating Device...
                      </Text>
                    </View>
                  )}
                  {(qrSessionStatus === 'CONSUMED' || qrSessionStatus === 'AUTHENTICATED') && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                      <CheckCircle2 size={13} color="#059669" />
                      <Text variant="caption" weight="bold" color="#059669" style={{ fontSize: 11 }}>
                        ✅ Mobile Device Connected & Logged In!
                      </Text>
                    </View>
                  )}
                  {qrSessionStatus === 'EXPIRED' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                      <X size={13} color="#EF4444" />
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
                      padding: 14,
                      backgroundColor: '#FFFFFF',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.08,
                      shadowRadius: 12,
                      elevation: 3,
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
                    <Text style={[styles.fieldLabel, { fontSize: 11, textAlign: 'center', marginBottom: 6 }]}>
                      WORKSPACE / INVITE CODE
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: '#F8FAFC',
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: '#E2E8F0',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                      }}
                    >
                      <TextInput
                        style={{ flex: 1, fontSize: 14, fontWeight: '700', color: '#059669', textAlign: 'center' }}
                        value={qrInviteCode}
                        onChangeText={setQrInviteCode}
                        placeholder="Type custom workspace code..."
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="characters"
                      />
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#059669',
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          borderRadius: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        onPress={handleGenerateNewQr}
                      >
                        <Zap size={12} color="#FFF" />
                        <Text variant="caption" weight="bold" color="#FFF" style={{ fontSize: 11 }}>
                          New
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryModalBtn, { backgroundColor: copiedLink ? '#047857' : '#059669' }]}
                  activeOpacity={0.85}
                  onPress={handleCopyInviteLink}
                >
                  {copiedLink ? <Check size={18} color="#FFFFFF" /> : <Copy size={18} color="#FFFFFF" />}
                  <Text style={styles.primaryModalBtnText}>
                    {copiedLink ? '✓ Link Copied to Clipboard!' : 'Copy & Share Invite Link'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryModalBtn, { backgroundColor: '#1E293B', marginTop: 8 }]}
                  onPress={() => handleJoinWorkspace(qrInviteCode)}
                >
                  <Sparkles size={16} color="#FFF" />
                  <Text style={styles.primaryModalBtnText}>
                    Join Workspace In-App Now
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryCancelBtn}
                  onPress={() => setShowQrModal(false)}
                >
                  <Text style={styles.secondaryCancelText}>Close</Text>
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
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowInviteModal(false)}
            />
            <View style={styles.modernModalCard}>
              <View style={styles.modernModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.modalIconBadge, { backgroundColor: '#ECFDF5' }]}>
                    <UserPlus size={20} color="#059669" />
                  </View>
                  <View>
                    <Text variant="h3" weight="bold" color="#0F172A">
                      Invite Team Member
                    </Text>
                    <Text variant="caption" color="#64748B" style={{ fontSize: 12, marginTop: 1 }}>
                      Add colleague with role permissions
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseCircle}
                  onPress={() => setShowInviteModal(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <TextInput
                    style={styles.modernTextInput}
                    placeholder="e.g. Vikram Malhotra"
                    placeholderTextColor="#94A3B8"
                    value={inviteName}
                    onChangeText={setInviteName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>
                    Email Address <Text style={{ color: '#EF4444' }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.modernTextInput}
                    placeholder="name@company.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Assign Role</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                    {(['AGENT', 'SUPERVISOR', 'ADMIN'] as const).map((r) => {
                      const isSelected = inviteRole === r;
                      return (
                        <TouchableOpacity
                          key={r}
                          style={[
                            styles.priorityCard,
                            isSelected
                              ? { backgroundColor: '#ECFDF5', borderColor: '#059669' }
                              : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
                          ]}
                          onPress={() => setInviteRole(r)}
                        >
                          <Text
                            style={[
                              styles.priorityCardText,
                              isSelected ? { color: '#059669' } : { color: '#64748B' },
                            ]}
                          >
                            {r}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Department</Text>
                  <TextInput
                    style={styles.modernTextInput}
                    placeholder="Sales & Marketing"
                    placeholderTextColor="#94A3B8"
                    value={inviteDept}
                    onChangeText={setInviteDept}
                  />
                </View>

                <TouchableOpacity
                  style={styles.primaryModalBtn}
                  onPress={handleSendInvite}
                  activeOpacity={0.85}
                >
                  <UserPlus size={18} color="#FFFFFF" />
                  <Text style={styles.primaryModalBtnText}>
                    Send Invitation
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryCancelBtn}
                  onPress={() => setShowInviteModal(false)}
                >
                  <Text style={styles.secondaryCancelText}>Cancel</Text>
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
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowCreateTaskModal(false)}
            />
            <View style={styles.modernModalCard}>
              {/* Modern Header */}
              <View style={styles.modernModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.modalIconBadge, { backgroundColor: '#ECFDF5' }]}>
                    <CheckSquare size={20} color="#059669" />
                  </View>
                  <View>
                    <Text variant="h3" weight="bold" color="#0F172A">
                      Create & Assign Task
                    </Text>
                    <Text variant="caption" color="#64748B" style={{ fontSize: 12, marginTop: 1 }}>
                      Assign actionable work to team
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseCircle}
                  onPress={() => setShowCreateTaskModal(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Task Title */}
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>
                    Task Title <Text style={{ color: '#EF4444' }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.modernTextInput}
                    placeholder="e.g. Follow up on High Intent Hospital Lead"
                    placeholderTextColor="#94A3B8"
                    value={taskTitle}
                    onChangeText={setTaskTitle}
                  />
                </View>

                {/* Assignee Selection */}
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Assignee</Text>
                  
                  {/* Selected Member Display Card */}
                  <View style={styles.selectedMemberCard}>
                    <View style={styles.memberAvatarMini}>
                      <Text style={styles.memberAvatarMiniText}>
                        {taskAssignee ? taskAssignee.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'TM'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                        {taskAssignee || 'Unassigned'}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#64748B' }}>
                        Assigned team member
                      </Text>
                    </View>
                    <View style={{ backgroundColor: '#ECFDF5', borderRadius: 10, padding: 4 }}>
                      <Check size={14} color="#059669" />
                    </View>
                  </View>

                  {/* Quick Select Member Chips */}
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B', marginBottom: 6 }}>
                    Quick Select Assignee:
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 6, paddingBottom: 4 }}
                  >
                    {teamMembers.map((m) => {
                      const isSelected = taskAssignee === m.name;
                      return (
                        <TouchableOpacity
                          key={m.id}
                          style={[
                            styles.quickMemberChip,
                            isSelected && styles.quickMemberChipActive,
                          ]}
                          onPress={() => setTaskAssignee(m.name)}
                        >
                          <Text
                            style={[
                              styles.quickMemberChipText,
                              isSelected && styles.quickMemberChipTextActive,
                            ]}
                          >
                            {m.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Priority Level Segmented Cards */}
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Priority Level</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                    {(['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => {
                      const isSelected = taskPriority === p;
                      const config = {
                        HIGH: { label: 'High', activeBg: '#FEF2F2', activeBorder: '#EF4444', activeText: '#DC2626', dot: '#EF4444' },
                        MEDIUM: { label: 'Medium', activeBg: '#FFFBEB', activeBorder: '#F59E0B', activeText: '#D97706', dot: '#F59E0B' },
                        LOW: { label: 'Low', activeBg: '#ECFDF5', activeBorder: '#10B981', activeText: '#059669', dot: '#10B981' },
                      }[p];

                      return (
                        <TouchableOpacity
                          key={p}
                          style={[
                            styles.priorityCard,
                            isSelected
                              ? { backgroundColor: config.activeBg, borderColor: config.activeBorder }
                              : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
                          ]}
                          onPress={() => setTaskPriority(p)}
                          activeOpacity={0.8}
                        >
                          <View style={[styles.priorityDot, { backgroundColor: config.dot }]} />
                          <Text
                            style={[
                              styles.priorityCardText,
                              isSelected ? { color: config.activeText } : { color: '#64748B' },
                            ]}
                          >
                            {config.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity
                  style={styles.primaryModalBtn}
                  onPress={handleCreateTask}
                  activeOpacity={0.85}
                >
                  <CheckSquare size={18} color="#FFFFFF" />
                  <Text style={styles.primaryModalBtnText}>
                    Create & Assign Task
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryCancelBtn}
                  onPress={() => setShowCreateTaskModal(false)}
                >
                  <Text style={styles.secondaryCancelText}>Cancel</Text>
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
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowCreateProjectModal(false)}
            />
            <View style={styles.modernModalCard}>
              <View style={styles.modernModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.modalIconBadge, { backgroundColor: '#EEF2FF' }]}>
                    <FolderPlus size={20} color="#4F46E5" />
                  </View>
                  <View>
                    <Text variant="h3" weight="bold" color="#0F172A">
                      New Workspace Project
                    </Text>
                    <Text variant="caption" color="#64748B" style={{ fontSize: 12, marginTop: 1 }}>
                      Organize workflows and team assignments
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseCircle}
                  onPress={() => setShowCreateProjectModal(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Project Name</Text>
                  <TextInput
                    style={styles.modernTextInput}
                    placeholder="e.g. Q4 WhatsApp Marketing Campaign"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Department</Text>
                  <TextInput
                    style={styles.modernTextInput}
                    placeholder="Sales & Marketing"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryModalBtn, { backgroundColor: '#4F46E5' }]}
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
                  activeOpacity={0.85}
                >
                  <FolderPlus size={18} color="#FFFFFF" />
                  <Text style={styles.primaryModalBtnText}>
                    Create Project
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryCancelBtn}
                  onPress={() => setShowCreateProjectModal(false)}
                >
                  <Text style={styles.secondaryCancelText}>Cancel</Text>
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
    borderRadius: 16,
  },
  heroCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  heroTitleGroup: {
    flex: 1,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  quickActionsContainer: {
    gap: 8,
    marginTop: 14,
  },
  actionGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickActionPrimary: {
    borderWidth: 0,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
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
  tabSegmentContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    marginBottom: 14,
  },
  tabSegmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
  },
  tabSegmentItemActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 12,
  },
  tabBadgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    fontSize: 11,
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
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  memberCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  memberAvatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  memberTextGroup: {
    flex: 1,
  },
  memberMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  memberCardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  memberActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
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
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modernModalCard: {
    width: '94%',
    maxWidth: 440,
    maxHeight: '90%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modernModalHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  modalIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  modernTextInput: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  priorityCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  priorityCardText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  primaryModalBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  secondaryCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  memberAvatarMini: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarMiniText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  quickMemberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickMemberChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  quickMemberChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  quickMemberChipTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  qrGraphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
});
