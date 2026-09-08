import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme';
import { useSessionStore } from '../../src/stores/sessionStore';
import { apiClient } from '../../src/api/client';
import { Building2, User, Phone, MapPin, Shield, Save, CheckCircle2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { user } = useSessionStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxGst, setTaxGst] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

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
    } catch (err) {
      console.warn('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await apiClient.patch('/api/profile', {
        client: {
          business_name: businessName.trim(),
          phone_number: phone.trim(),
          address: address.trim(),
          tax_id_gstin: taxGst.trim(),
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
                placeholder="e.g. Unified Web Options"
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
});
