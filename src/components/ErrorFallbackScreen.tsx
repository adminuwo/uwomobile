import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

interface ErrorFallbackScreenProps {
  error: Error | null;
  onRestart: () => void;
}

export const ErrorFallbackScreen: React.FC<ErrorFallbackScreenProps> = ({ error, onRestart }) => {
  const [showDetails, setShowDetails] = useState(false);

  const errorMessage = error?.message || 'An unexpected runtime error occurred.';
  const errorStack = error?.stack || '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Abha & Dev Mascot Hero */}
        <View style={styles.heroContainer}>
          <Image
            source={require('../../assets/images/abha_dev_login.png')}
            style={styles.mascotImage}
            resizeMode="contain"
          />
          <View style={styles.personasRow}>
            <View style={styles.personaBadgeAbha}>
              <View style={[styles.personaDot, { backgroundColor: '#EC4899' }]} />
              <Text style={styles.personaText}>Abha</Text>
            </View>
            <View style={styles.personaBadgeDev}>
              <View style={[styles.personaDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.personaText}>Dev</Text>
            </View>
          </View>
        </View>

        {/* Oops Heading */}
        <View style={styles.headingSection}>
          <Text style={styles.oopsTitle}>Oops! Something went wrong</Text>
          <Text style={styles.oopsSubtitle}>
            Abha & Dev are looking into this. You can restart the app or try again.
          </Text>
        </View>

        {/* Error Details Box */}
        <View style={styles.errorCard}>
          <View style={styles.errorHeader}>
            <View style={styles.errorIconCircle}>
              <Text style={styles.errorExclamation}>!</Text>
            </View>
            <Text style={styles.errorCardTitle}>Error Details</Text>
          </View>

          <Text style={styles.errorMessageText} selectable>
            {errorMessage}
          </Text>

          {errorStack ? (
            <TouchableOpacity
              onPress={() => setShowDetails(!showDetails)}
              style={styles.detailsToggle}
              activeOpacity={0.7}
            >
              <Text style={styles.detailsToggleText}>
                {showDetails ? 'Hide technical trace ▲' : 'Show technical trace ▼'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {showDetails && errorStack ? (
            <ScrollView style={styles.stackBox} nestedScrollEnabled>
              <Text style={styles.stackText} selectable>
                {errorStack}
              </Text>
            </ScrollView>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onRestart}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Restart App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onRestart}
            activeOpacity={0.75}
          >
            <Text style={styles.secondaryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  mascotImage: {
    width: 240,
    height: 180,
    maxHeight: 200,
  },
  personasRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  personaBadgeAbha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  personaBadgeDev: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  personaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  personaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  headingSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  oopsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  oopsSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  errorIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorExclamation: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 13,
  },
  errorCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorMessageText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
    fontFamily: 'monospace',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsToggle: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  detailsToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  stackBox: {
    maxHeight: 120,
    marginTop: 8,
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 6,
  },
  stackText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  actionsContainer: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#00AB56',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00AB56',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
});
