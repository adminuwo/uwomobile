import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Avatar } from '../../src/components/Avatar';
import { useTheme } from '../../src/theme';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useBrandStore } from '../../src/stores/brandStore';
import { apiClient } from '../../src/api/client';
import { useRouter } from 'expo-router';
import { Building2, User, Phone, MapPin, Shield, Save, CheckCircle2, Activity, RefreshCw, Server, Database, Laptop, ChevronRight, QrCode, ShieldCheck, Trash2, Camera, Upload, ImageIcon } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useSessionStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxGst, setTaxGst] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [healthData, setHealthData] = useState<{
    status: string;
    database: string;
    latencyMs?: number;
    environment?: string;
  } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setCheckingHealth(true);
      const start = Date.now();
      const res = await apiClient.get<any>('/api/health');
      const latency = Date.now() - start;
      setHealthData({
        status: res?.status || 'healthy',
        database: res?.database?.status || 'connected',
        latencyMs: latency,
        environment: res?.environment || 'production',
      });
    } catch (e: any) {
      setHealthData({
        status: 'degraded',
        database: 'unreachable',
        latencyMs: 0,
        environment: 'offline',
      });
    } finally {
      setCheckingHealth(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>('/api/profile');
      const clientData = res?.client || {};
      const userData = res?.user || res || {};

      setBusinessName(clientData.business_name || clientData.name || '');
      setContactName(userData.name || userData.first_name || user?.name || '');
      setPhone(clientData.phone_number || userData.phone_number || '');
      setAddress(clientData.address || '');
      setTaxGst(clientData.tax_id_gstin || '');
      setLogoUrl(clientData.company_logo_url || clientData.white_label_logo || null);
    } catch (err) {
      console.warn('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setUploadingLogo(true);

      const base64Data = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const mimeType = asset.mimeType || 'image/jpeg';
      const dataUri = `data:${mimeType};base64,${base64Data}`;

      setLogoUrl(dataUri);

      // Auto-save immediately to backend profile
      await apiClient.patch('/api/profile', {
        company_logo_url: dataUri,
        client: {
          company_logo_url: dataUri,
        },
      });

      // Synchronize brand store
      useBrandStore.getState().fetchBrandConfig().catch(() => {});
      Alert.alert('Profile Updated', 'Profile icon updated successfully.');
    } catch (err: any) {
      console.error('Error selecting or saving profile icon:', err);
      Alert.alert('Upload Error', err?.message || 'Failed to update profile photo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile / brand logo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploadingLogo(true);
              setLogoUrl(null);
              await apiClient.patch('/api/profile', {
                company_logo_url: '',
                client: {
                  company_logo_url: '',
                },
              });
              useBrandStore.getState().fetchBrandConfig().catch(() => {});
              Alert.alert('Removed', 'Profile icon removed successfully.');
            } catch (err: any) {
              Alert.alert('Error', 'Failed to remove profile icon.');
            } finally {
              setUploadingLogo(false);
            }
          },
        },
      ]
    );
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Profile & Brand Icon',
      'Choose an option to update your profile photo or company logo',
      [
        {
          text: 'Select Image / Photo',
          onPress: () => handlePickImage(),
        },
        ...(logoUrl
          ? [
              {
                text: 'Remove Photo',
                style: 'destructive' as const,
                onPress: handleRemovePhoto,
              },
            ]
          : []),
        {
          text: 'Cancel',
          style: 'cancel' as const,
        },
      ]
    );
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await apiClient.patch('/api/profile', {
        company_logo_url: logoUrl || '',
        client: {
          business_name: businessName.trim(),
          phone_number: phone.trim(),
          address: address.trim(),
          tax_id_gstin: taxGst.trim(),
          company_logo_url: logoUrl || '',
        },
        user: {
          name: contactName.trim(),
        }
      });
      Alert.alert('Settings Saved', 'Your organization settings and profile were updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']}>
      <Header title="Settings & Profile" showMenu={true} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Profile & Brand Avatar Card */}
          <Text variant="label" style={styles.sectionLabel}>Profile & Brand Icon</Text>
          <Card style={styles.avatarCard}>
            <View style={styles.avatarRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={showPhotoOptions}
                style={styles.avatarWrapper}
              >
                <Avatar
                  uri={logoUrl}
                  name={businessName || contactName || 'UWO'}
                  size="xl"
                />
                <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
                  {uploadingLogo ? (
                    <ActivityIndicator size={12} color="#FFFFFF" />
                  ) : (
                    <Camera size={13} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.avatarMeta}>
                <Text variant="body" weight="bold" color={colors.textPrimary} numberOfLines={1}>
                  {businessName || contactName || 'Organization Logo'}
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2, marginBottom: 10 }}>
                  Tap avatar or use button to upload brand icon
                </Text>

                <View style={styles.avatarBtnRow}>
                  <TouchableOpacity
                    onPress={handlePickImage}
                    disabled={uploadingLogo}
                    style={[styles.actionChip, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}
                  >
                    <Upload size={12} color={colors.primary} />
                    <Text style={[styles.actionChipText, { color: colors.primary }]}>
                      {logoUrl ? 'Change Icon' : 'Upload Icon'}
                    </Text>
                  </TouchableOpacity>

                  {logoUrl ? (
                    <TouchableOpacity
                      onPress={handleRemovePhoto}
                      disabled={uploadingLogo}
                      style={[styles.actionChip, { backgroundColor: colors.error + '12', borderColor: colors.error + '30' }]}
                    >
                      <Trash2 size={12} color={colors.error} />
                      <Text style={[styles.actionChipText, { color: colors.error }]}>Remove</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          </Card>

          {/* Organization Settings */}
          <Text variant="label" style={styles.sectionLabel}>Organization Information</Text>
          <Card style={styles.card}>
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Building2 size={14} color={colors.primary} />
                <Text variant="caption" weight="bold" color={colors.textSecondary}>Company / Brand Name</Text>
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="e.g. Acme Corp / Your Workspace"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Shield size={14} color={colors.primary} />
                <Text variant="caption" weight="bold" color={colors.textSecondary}>GSTIN / Tax ID</Text>
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                value={taxGst}
                onChangeText={setTaxGst}
                placeholder="GST Identification Number"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <MapPin size={14} color={colors.primary} />
                <Text variant="caption" weight="bold" color={colors.textSecondary}>Business Address</Text>
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Office or registered address"
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>
          </Card>

          {/* Contact Details */}
          <Text variant="label" style={styles.sectionLabel}>Contact & Admin Profile</Text>
          <Card style={styles.card}>
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <User size={14} color={colors.primary} />
                <Text variant="caption" weight="bold" color={colors.textSecondary}>Account Owner Name</Text>
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                value={contactName}
                onChangeText={setContactName}
                placeholder="Full Name"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Phone size={14} color={colors.primary} />
                <Text variant="caption" weight="bold" color={colors.textSecondary}>Business Phone Number</Text>
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91..."
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          </Card>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 }}>
            <Text variant="label" style={styles.sectionLabel}>System & Cloud API Health</Text>
            <TouchableOpacity
              onPress={fetchHealth}
              disabled={checkingHealth}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#F1F5F9', borderRadius: 8 }}
            >
              <RefreshCw size={12} color="#059669" />
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#059669' }}>
                {checkingHealth ? 'Checking...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Server size={16} color={colors.primary} />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Backend API Service</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: healthData?.status === 'healthy' ? '#ECFDF5' : '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: healthData?.status === 'healthy' ? '#10B981' : '#EF4444' }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: healthData?.status === 'healthy' ? '#059669' : '#DC2626' }}>
                  {healthData ? (healthData.status === 'healthy' ? 'OPERATIONAL' : 'DEGRADED') : 'CHECKING...'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Database size={16} color="#6366F1" />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Database Connection</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: healthData?.database === 'connected' ? '#059669' : '#64748B' }}>
                {healthData?.database === 'connected' ? 'Connected (Postgres)' : healthData?.database || 'Pending'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Activity size={16} color="#F59E0B" />
                <Text variant="caption" weight="bold" color={colors.textPrimary}>Network Latency</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#334155' }}>
                {healthData?.latencyMs ? `${healthData.latencyMs} ms` : '< 50 ms'}
              </Text>
            </View>
          </Card>

          {/* Linked Devices & Web Login */}
          <Text variant="label" style={styles.sectionLabel}>Linked Devices & Web Login</Text>
          <Card style={styles.card}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
              onPress={() => router.push('/(app)/linked-devices' as any)}
            >
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' }}>
                <Laptop size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  Linked Devices
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                  Link computers or log out web sessions
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>

          {/* Legal & Account Governance */}
          <Text variant="label" style={styles.sectionLabel}>Legal & Compliance</Text>
          <Card style={styles.card}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
              onPress={() => router.push('/(app)/legal' as any)}
            >
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#05966915', justifyContent: 'center', alignItems: 'center' }}>
                <ShieldCheck size={22} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold" color={colors.textPrimary}>
                  Legal Center
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                  Terms & Conditions, Privacy Policy & Permissions
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.borderMuted }} />

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
              onPress={() => router.push('/(app)/legal/delete-account' as any)}
            >
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.error + '15', justifyContent: 'center', alignItems: 'center' }}>
                <Trash2 size={20} color={colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold" color={colors.error}>
                  Delete Account
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                  Permanently deactivate account and credentials
                </Text>
              </View>
              <ChevronRight size={18} color={colors.error} />
            </TouchableOpacity>
          </Card>

          <Button
            title={saving ? "Saving Changes..." : "Save Settings"}
            onPress={handleSave}
            loading={saving}
            icon={<Save size={16} color="#FFFFFF" />}
            style={styles.saveBtn}
          />


        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    padding: 16,
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  saveBtn: {
    marginTop: 24,
  },
  avatarCard: {
    padding: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatarMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  avatarBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
