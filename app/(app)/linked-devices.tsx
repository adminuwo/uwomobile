import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme';
import { linkedDevicesApi, LinkedDeviceItem, QrScanResult } from '../../src/api/linkedDevices';
import {
  Laptop,
  Monitor,
  Globe,
  QrCode,
  Plus,
  LogOut,
  ShieldCheck,
  Clock,
  Calendar,
  Trash2,
  X,
  Check,
  AlertCircle,
  Camera,
  Layers,
  KeyRound,
  Info,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Safe check for ExpoCamera native module presence in current binary build
const isNativeCameraSupported = (): boolean => {
  try {
    const mod = requireOptionalNativeModule('ExpoCamera');
    return !!mod;
  } catch {
    return false;
  }
};

// Safe lazy accessor for CameraView
let CachedCameraView: any = null;
const getCameraView = () => {
  if (CachedCameraView) return CachedCameraView;
  if (isNativeCameraSupported()) {
    try {
      const expoCamera = require('expo-camera');
      CachedCameraView = expoCamera.CameraView || expoCamera.Camera;
      return CachedCameraView;
    } catch (e) {
      console.warn('Could not load ExpoCamera:', e);
    }
  }
  return null;
};

export default function LinkedDevicesScreen() {
  const { colors, spacing } = useTheme();
  const hasCameraSupport = isNativeCameraSupported();
  const CameraViewComponent = getCameraView();

  const [devices, setDevices] = useState<LinkedDeviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  // Scanner modal state
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Approval confirmation modal state
  const [pendingSession, setPendingSession] = useState<QrScanResult | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const isProcessingRef = useRef(false);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await linkedDevicesApi.getLinkedDevices();
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load linked devices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Extract session ID from scanned QR data
  const extractSessionId = (data: string): string => {
    const trimmed = data.trim();
    if (trimmed.includes('session_id=')) {
      const match = trimmed.match(/session_id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) return match[1];
    }
    // Direct hex session ID
    return trimmed;
  };

  const handleOpenScanner = async () => {
    if (!hasCameraSupport || !CameraViewComponent) {
      // Current native binary does not have ExpoCamera compiled
      setShowManualInput(true);
      return;
    }

    try {
      const expoCamera = require('expo-camera');
      const getPerms = expoCamera.Camera?.getCameraPermissionsAsync;
      const reqPerms = expoCamera.Camera?.requestCameraPermissionsAsync;
      if (getPerms && reqPerms) {
        const currentPerm = await getPerms();
        if (!currentPerm.granted) {
          const res = await reqPerms();
          if (!res.granted) {
            Alert.alert(
              'Camera Permission Needed',
              'Camera access is required to scan the desktop login QR code. You can also enter the code manually.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Enter Code Manually', onPress: () => setShowManualInput(true) },
              ]
            );
            return;
          }
        }
      }
      isProcessingRef.current = false;
      setShowScanner(true);
    } catch (e) {
      console.warn('Failed to initialize camera scanner:', e);
      setShowManualInput(true);
    }
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (isProcessingRef.current || !data) return;
    isProcessingRef.current = true;

    const sessionId = extractSessionId(data);
    await processSessionId(sessionId);
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    const sessionId = extractSessionId(manualCode.trim());
    await processSessionId(sessionId);
  };

  const processSessionId = async (sessionId: string) => {
    setIsScanning(true);
    try {
      const res = await linkedDevicesApi.scanQr(sessionId);
      setShowScanner(false);
      setShowManualInput(false);
      setManualCode('');
      setPendingSession(res);
    } catch (err: any) {
      console.warn('QR scan error:', err);
      Alert.alert(
        'Scan Failed',
        err?.response?.data?.error || err?.message || 'Invalid or expired QR code. Please refresh the QR code on your computer.',
        [{ text: 'OK', onPress: () => { isProcessingRef.current = false; } }]
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleApprove = async () => {
    if (!pendingSession) return;
    setApproving(true);
    try {
      const res = await linkedDevicesApi.approveQr(pendingSession.session_id);
      Alert.alert('✅ Device Linked', `${res.device_name || 'Web Browser'} has been authenticated successfully.`);
      setPendingSession(null);
      fetchDevices();
    } catch (err: any) {
      console.warn('Approval failed:', err);
      Alert.alert(
        'Link Failed',
        err?.response?.data?.error || err?.message || 'Failed to approve device linking.'
      );
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!pendingSession) return;
    setRejecting(true);
    try {
      await linkedDevicesApi.rejectQr(pendingSession.session_id);
      setPendingSession(null);
    } catch (err) {
      setPendingSession(null);
    } finally {
      setRejecting(false);
    }
  };

  const handleRevoke = (device: LinkedDeviceItem) => {
    Alert.alert(
      'Log Out Device?',
      `Are you sure you want to log out from ${device.device_name}? The web session will be terminated immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setRevokingId(device.id);
            try {
              await linkedDevicesApi.revokeDevice(device.id);
              fetchDevices();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.error || 'Failed to revoke device.');
            } finally {
              setRevokingId(null);
            }
          },
        },
      ]
    );
  };

  const handleRevokeAll = () => {
    Alert.alert(
      'Log Out From All Devices?',
      'This will immediately log out all connected web and desktop sessions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out All',
          style: 'destructive',
          onPress: async () => {
            setRevokingAll(true);
            try {
              await linkedDevicesApi.revokeAllDevices();
              fetchDevices();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.error || 'Failed to revoke all devices.');
            } finally {
              setRevokingAll(false);
            }
          },
        },
      ]
    );
  };

  const formatLastActive = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 2) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Linked Devices" showBack={true} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Hero Banner */}
          <Card style={[styles.heroCard, { backgroundColor: colors.surface }]}>
            <View style={styles.heroRow}>
              <View style={[styles.heroIconBox, { backgroundColor: colors.primary + '15' }]}>
                <Monitor size={32} color={colors.primary} />
              </View>
              <View style={styles.heroTextCol}>
                <Text variant="h3" weight="bold" color={colors.textPrimary}>
                  Use Uwo Connect on Web
                </Text>
                <Text variant="label" color={colors.textSecondary} style={{ marginTop: 2 }}>
                  Log in on your desktop or laptop without entering your password.
                </Text>
              </View>
            </View>

            <Button
              title={hasCameraSupport ? "Link a New Device" : "Link Device via Code"}
              icon={hasCameraSupport ? <QrCode size={18} color="#FFF" /> : <KeyRound size={18} color="#FFF" />}
              onPress={handleOpenScanner}
              style={styles.linkButton}
            />

            {!hasCameraSupport && (
              <TouchableOpacity
                style={[styles.inlineNotice, { backgroundColor: colors.primary + '0D', borderColor: colors.primary + '25' }]}
                onPress={() => setShowManualInput(true)}
                activeOpacity={0.7}
              >
                <Info size={14} color={colors.primary} />
                <Text variant="caption" color={colors.textSecondary} style={{ flex: 1, fontSize: 11 }}>
                  Tap here to enter or paste the session code from your desktop screen.
                </Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* Active Devices Section */}
          <View style={styles.sectionHeader}>
            <Text variant="label" color={colors.textSecondary} weight="bold">
              Active Linked Devices ({devices.length})
            </Text>
            {devices.length > 1 && (
              <TouchableOpacity onPress={handleRevokeAll} disabled={revokingAll}>
                <Text variant="caption" weight="bold" color={colors.error}>
                  {revokingAll ? 'Logging out...' : 'Log out all'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {devices.length === 0 ? (
            <Card style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.border + '30' }]}>
                <Laptop size={28} color={colors.textMuted} />
              </View>
              <Text variant="body" weight="bold" color={colors.textPrimary} style={{ marginTop: 12 }}>
                No Linked Devices
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.emptySubtitle}>
                You have not linked Uwo Connect to any web browsers yet. Open uwoconnect.com on your computer to get started.
              </Text>
            </Card>
          ) : (
            <View style={styles.deviceList}>
              {devices.map((device) => {
                const isRevoking = revokingId === device.id;
                return (
                  <Card key={device.id} style={[styles.deviceCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.deviceRow}>
                      <View style={[styles.deviceIconBox, { backgroundColor: colors.primary + '12' }]}>
                        <Globe size={22} color={colors.primary} />
                      </View>
                      
                      <View style={styles.deviceInfoCol}>
                        <View style={styles.deviceNameRow}>
                          <Text variant="body" weight="bold" color={colors.textPrimary} numberOfLines={1}>
                            {device.device_name}
                          </Text>
                          <View style={styles.liveDot} />
                        </View>
                        
                        <View style={styles.metaRow}>
                          <Clock size={11} color={colors.textMuted} />
                          <Text variant="caption" color={colors.textSecondary}>
                            Last active: {formatLastActive(device.last_active_at)}
                          </Text>
                        </View>

                        {device.linked_at && (
                          <View style={styles.metaRow}>
                            <Calendar size={11} color={colors.textMuted} />
                            <Text variant="caption" color={colors.textMuted}>
                              Linked: {new Date(device.linked_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        style={[styles.revokeBtn, { backgroundColor: colors.error + '12' }]}
                        onPress={() => handleRevoke(device)}
                        disabled={isRevoking}
                      >
                        {isRevoking ? (
                          <ActivityIndicator size="small" color={colors.error} />
                        ) : (
                          <>
                            <LogOut size={13} color={colors.error} />
                            <Text variant="caption" weight="bold" color={colors.error}>
                              Log Out
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}

          {/* Security Guarantee Card */}
          <View style={styles.securityNote}>
            <ShieldCheck size={16} color={colors.primary} />
            <Text variant="caption" color={colors.textMuted} style={{ flex: 1 }}>
              Your connection is protected by end-to-end device linking. Only devices scanned and approved by this phone can access your workspace.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Camera QR Scanner Modal */}
      <Modal visible={showScanner} animationType="slide" transparent={false}>
        <View style={styles.scannerContainer}>
          {/* Camera Viewfinder */}
          {CameraViewComponent ? (
            <CameraViewComponent
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={handleBarcodeScanned}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.center, { backgroundColor: '#000', padding: 24 }]}>
              <AlertCircle size={48} color={colors.warning || '#F59E0B'} />
              <Text variant="h3" weight="bold" color="#FFF" style={{ marginTop: 16, textAlign: 'center' }}>
                Camera Scanner Unavailable
              </Text>
              <Text variant="label" color="#94A3B8" style={{ marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
                This APK build does not include the native camera module. Please use the Session Code option to link your device.
              </Text>
              <Button
                title="Enter Session Code"
                onPress={() => {
                  setShowScanner(false);
                  setShowManualInput(true);
                }}
                style={{ marginTop: 24, backgroundColor: colors.primary }}
              />
            </View>
          )}

          {/* Top Bar with Close Button */}
          <View style={styles.scannerTopBar}>
            <Text variant="h3" weight="bold" color="#FFF">
              Scan QR Code
            </Text>
            <TouchableOpacity
              onPress={() => setShowScanner(false)}
              style={styles.scannerCloseBtn}
            >
              <X size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Viewfinder Target Box */}
          <View style={styles.viewfinderCenter}>
            <View style={styles.viewfinderBox}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text variant="body" weight="bold" color="#FFF" style={styles.viewfinderInstruction}>
              Point your camera at the QR code on your computer screen
            </Text>
          </View>

          {/* Bottom Controls */}
          <View style={styles.scannerBottomBar}>
            {isScanning ? (
              <View style={styles.scanningLoader}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text variant="label" weight="bold" color="#FFF" style={{ marginTop: 8 }}>
                  Validating session...
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setShowScanner(false);
                  setShowManualInput(true);
                }}
                style={styles.manualEntryLink}
              >
                <KeyRound size={16} color="#FFF" />
                <Text variant="caption" weight="bold" color="#FFF">
                  Enter Session Code Manually
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Manual Code Input Modal (Simulator / Testing Fallback) */}
      <Modal visible={showManualInput} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeaderRow}>
              <Text variant="h3" weight="bold" color={colors.textPrimary}>
                Enter QR Session Code
              </Text>
              <TouchableOpacity onPress={() => setShowManualInput(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text variant="label" color={colors.textSecondary} style={{ marginTop: 4, marginBottom: 16 }}>
              Copy the session code or URL displayed on your desktop login screen.
            </Text>

            <TextInput
              style={[styles.manualInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="Paste session code..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActionRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setShowManualInput(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Verify Code"
                disabled={!manualCode.trim() || isScanning}
                onPress={handleManualSubmit}
                style={{ flex: 1, backgroundColor: colors.primary }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Bottom Sheet Modal */}
      <Modal visible={!!pendingSession} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.confirmIconCircle, { backgroundColor: colors.primary + '15' }]}>
              <Laptop size={36} color={colors.primary} />
            </View>

            <Text variant="h2" weight="bold" color={colors.textPrimary} style={styles.confirmTitle}>
              Link this device?
            </Text>
            <Text variant="label" color={colors.textSecondary} style={styles.confirmSubtitle}>
              This will grant full access to your Uwo Connect account on the following browser:
            </Text>

            {pendingSession && (
              <View style={[styles.sessionDetailBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.detailRow}>
                  <Text variant="caption" weight="bold" color={colors.textSecondary}>Device:</Text>
                  <Text variant="label" weight="bold" color={colors.textPrimary}>
                    {pendingSession.device_name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="caption" weight="bold" color={colors.textSecondary}>Browser:</Text>
                  <Text variant="label" color={colors.textPrimary}>
                    {pendingSession.browser} ({pendingSession.operating_system})
                  </Text>
                </View>
                {pendingSession.ip_address && (
                  <View style={styles.detailRow}>
                    <Text variant="caption" weight="bold" color={colors.textSecondary}>IP Address:</Text>
                    <Text variant="label" color={colors.textMuted}>
                      {pendingSession.ip_address}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.modalActionRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={handleReject}
                disabled={approving || rejecting}
                style={{ flex: 1 }}
              />
              <Button
                title={approving ? 'Linking...' : 'Link Device'}
                onPress={handleApprove}
                disabled={approving || rejecting}
                icon={approving ? <ActivityIndicator size="small" color="#FFF" /> : <Check size={16} color="#FFF" />}
                style={{ flex: 1.4, backgroundColor: colors.primary }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroTextCol: {
    flex: 1,
  },
  linkButton: {
    borderRadius: 16,
  },
  inlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  deviceList: {
    gap: 12,
  },
  deviceCard: {
    padding: 16,
    borderRadius: 20,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  revokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 8,
  },
  // Scanner Styles
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerTopBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  scannerCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderBox: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#10B981',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  viewfinderInstruction: {
    marginTop: 28,
    textAlign: 'center',
    maxWidth: SCREEN_WIDTH * 0.75,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scannerBottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  scanningLoader: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 16,
  },
  manualEntryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  modalHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  manualInput: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 20,
  },
  confirmIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    textAlign: 'center',
  },
  confirmSubtitle: {
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  sessionDetailBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
});
