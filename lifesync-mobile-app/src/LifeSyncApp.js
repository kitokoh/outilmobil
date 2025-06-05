import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Button } from 'react-native';
import { Bell, User, Calendar, Home, Plus, Settings, Users as UsersIcon, Brain, LogOut } from 'lucide-react-native'; // Added LogOut icon

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore'; // If using Firestore directly on client
import {
  REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_AUTH_DOMAIN,
  REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_STORAGE_BUCKET,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  REACT_APP_FIREBASE_APP_ID
} from '@env';

const firebaseConfig = {
  apiKey: REACT_APP_FIREBASE_API_KEY,
  authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: REACT_APP_FIREBASE_APP_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully!");
} else {
  firebase.app(); // if already initialized, use that one
  console.log("Firebase already initialized.");
}

// Import components
import Dashboard from './components/Dashboard';
import AppointmentsView from './components/AppointmentsView';
import ChallengesView from './components/ChallengesView';
import CommunityView from './components/CommunityView';
import AiView from './components/AiView';
import AllReminders from './components/AllReminders';
import ProfileSelector from './components/ProfileSelector';
import LoginScreen from './components/LoginScreen'; // Import LoginScreen
import SettingsScreen from './components/SettingsScreen';

// Import Zustand store
import useStore from './store';
import RegistrationScreen from './components/RegistrationScreen';

const LifeSyncApp = () => {
  const { isAuthenticated, checkAuthState, user, currentView, setCurrentView } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [authFlowView, setAuthFlowView] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    const unsubscribe = checkAuthState(); // checkAuthState from store handles initialization

    // Simulate loading, or use a more robust way to determine when auth state is known
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Adjust timeout or use a flag from checkAuthState if it provides one

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      clearTimeout(timer);
    };
  }, [checkAuthState]); // checkAuthState is stable, so this runs once on mount

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#333' }}>Loading LifeSync...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    // Conceptual navigation for auth flow
    // In a real app, this would be handled by React Navigation (e.g., a StackNavigator)
    const mockNavigation = {
        navigate: (screenName) => {
            if (screenName === 'Registration') setAuthFlowView('register');
            else if (screenName === 'Login') setAuthFlowView('login');
            // In a real app, this would also handle navigation to main app stack upon login/register success
        },
        goBack: () => setAuthFlowView('login'), // Simple goBack for registration screen
    };
    if (authFlowView === 'login') {
      return <LoginScreen navigation={mockNavigation} styles={styles} />; // Pass styles
    }
    if (authFlowView === 'register') {
      return <RegistrationScreen navigation={mockNavigation} styles={styles} />; // Pass styles
    }
    // Fallback to LoginScreen if authFlowView is somehow invalid
    return <LoginScreen navigation={mockNavigation} styles={styles} />; // Pass styles
  }

  // --- Authenticated App View ---
  // This part is the original authenticated view structure from LifeSyncApp.js
  // (Copied from a representative version of the original file structure for brevity in this example)
  // Ensure all necessary imports (Bell, User, Calendar, etc., and components) are at the top of the file.
  const { logout, notifications } = useStore.getState(); // Direct call for simplicity in example

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>LifeSync</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButtonHeader}>
                <Bell size={24} color={styles.textSlate600.color} />
                {notifications > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>{notifications}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCurrentView('profile')}
                style={styles.userProfileButton}
              >
                <User size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={logout} style={styles.iconButtonHeader}>
                <LogOut size={24} color={styles.textSlate600.color} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {currentView === 'dashboard' && <Dashboard styles={styles} />}
          {currentView === 'reminders' && <AllReminders styles={styles} />}
          {currentView === 'appointments' && <AppointmentsView styles={styles} />}
          {currentView === 'challenges' && <ChallengesView styles={styles} />}
          {currentView === 'community' && <CommunityView styles={styles} />}
          {currentView === 'ai' && <AiView styles={styles} />}
          {currentView === 'profile' && <ProfileSelector styles={styles} />}
          {currentView === 'settings' && <SettingsScreen styles={styles} />}
        </View>
      </ScrollView>
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavContent}>
          <TouchableOpacity onPress={() => setCurrentView('dashboard')} style={styles.bottomNavItem}>
            <Home size={22} color={currentView === 'dashboard' ? colors.primary : colors.textLight} />
            <Text style={[
              styles.bottomNavText,
              { color: currentView === 'dashboard' ? colors.primary : colors.textLight },
              currentView === 'dashboard' && { fontWeight: fontWeights.bold }
            ]}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentView('reminders')} style={styles.bottomNavItem}>
            <Calendar size={22} color={currentView === 'reminders' ? colors.primary : colors.textLight} />
            <Text style={[
              styles.bottomNavText,
              { color: currentView === 'reminders' ? colors.primary : colors.textLight },
              currentView === 'reminders' && { fontWeight: fontWeights.bold }
            ]}>Rappels</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentView('community')} style={styles.bottomNavItem}>
            <UsersIcon size={22} color={currentView === 'community' ? colors.primary : colors.textLight} />
            <Text style={[
              styles.bottomNavText,
              { color: currentView === 'community' ? colors.primary : colors.textLight },
              currentView === 'community' && { fontWeight: fontWeights.bold }
            ]}>Social</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentView('ai')} style={styles.bottomNavItem}>
            <Brain size={22} color={currentView === 'ai' ? colors.primary : colors.textLight} />
            <Text style={[
              styles.bottomNavText,
              { color: currentView === 'ai' ? colors.primary : colors.textLight },
              currentView === 'ai' && { fontWeight: fontWeights.bold }
            ]}>IA Coach</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavItem} onPress={() => setCurrentView('settings')}>
            <Settings size={22} color={currentView === 'settings' ? colors.primary : colors.textLight} />
            <Text style={[
              styles.bottomNavText,
              { color: currentView === 'settings' ? colors.primary : colors.textLight },
              currentView === 'settings' && { fontWeight: fontWeights.bold }
            ]}>Plus</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LifeSyncApp;

const oldColors = {
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate900: '#0F172A',
  white: '#FFFFFF',
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo500: '#6366F1',
  indigo600: '#4F46E5', // Primary
  sky500: '#0EA5E9', // Secondary
  emerald500: '#10B981', // Success
  amber500: '#F59E0B', // Accent / Warning
  red600: '#DC2626',     // Error
  orange600: '#EA580C',
  pink600: '#DB2777',
  gray700: '#374151',
  blue600: '#2563EB',
};

const colors = {
  primary: oldColors.indigo600,
  primaryDark: '#3D37B8',
  primaryLight: oldColors.indigo500,
  primaryBg: oldColors.indigo50,
  secondary: oldColors.sky500,
  accent: oldColors.amber500,
  success: oldColors.emerald500,
  error: oldColors.red600,
  warning: oldColors.amber500,

  background: oldColors.slate50,
  surface: oldColors.white,
  border: oldColors.slate200,

  text: oldColors.slate900,
  textSecondary: oldColors.slate600,
  textLight: oldColors.slate400, // For less important text
  textDisabled: oldColors.slate300,
  textOnPrimary: oldColors.white,
  textOnSecondary: oldColors.white,
  textOnError: oldColors.white,

  // Keep original colors for specific use cases if needed, or map them.
  ...oldColors, // Can be pruned later
};

const textSizes = {
  xs: 12,
  sm: 14,
  md: 16, // Changed 'base' to 'md'
  lg: 18,
  xl: 20,
  xxl: 24, // Changed '2xl' to 'xxl'
  xxxl: 30, // Changed '3xl' to 'xxxl'
  xxxxl: 36, // Added for larger headings
};

const fontWeights = {
  light: '300',
  regular: '400', // Changed 'normal' to 'regular'
  medium: '500',
  semibold: '600',
  bold: '700',
};

const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Example text style definitions (can be expanded)
const textStyles = {
  h1: {
    fontSize: textSizes.xxxxl,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  h2: {
    fontSize: textSizes.xxxl,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  h3: {
    fontSize: textSizes.xxl,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  body: {
    fontSize: textSizes.md,
    fontWeight: fontWeights.regular,
    color: colors.text,
  },
  caption: {
    fontSize: textSizes.sm,
    fontWeight: fontWeights.regular,
    color: colors.textSecondary,
  },
  button: {
    fontSize: textSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.textOnPrimary,
  },
};


const styles = StyleSheet.create({
  // textIndigo600 and textSlate400 were removed as direct styles earlier
  // They are now applied dynamically using colors.primary and colors.textLight

  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollViewContent: { flexGrow: 1 },
  contentContainer: { padding: spacing.md, paddingBottom: spacing.lg + spacing.md }, // Adjusted paddingBottom

  headerContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: textSizes.xl, fontWeight: fontWeights.bold, color: colors.primary }, // Updated
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  iconButtonHeader: { padding: spacing.xs },
  notificationBell: { position: 'relative' },
  notificationBadge: {
    position: 'absolute',
    top: -spacing.xxs, right: -spacing.xxs,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 18, height: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  notificationText: { color: colors.textOnError, fontSize: textSizes.xs, fontWeight: fontWeights.bold },
  userProfileButton: {
    width: 36, height: 36,
    backgroundColor: colors.primary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },

  bottomNavContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.xs, // Adjusted
    paddingTop: spacing.xxs, // Adjusted
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavContent: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  bottomNavItem: { alignItems: 'center', flex: 1, paddingVertical: spacing.xs, gap: spacing.xxs }, // Adjusted
  bottomNavText: { fontSize: textSizes.xs, fontWeight: fontWeights.medium },
  // activeColor and inactiveColor can be applied directly using currentView logic
  // activeColor: { color: colors.primary },
  // inactiveColor: { color: colors.textLight },

  viewContainer: { padding: spacing.md, flex: 1, gap: spacing.lg }, // Adjusted
  viewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  viewTitle: { ...textStyles.h3, color: colors.text }, // Example usage of textStyles
  viewSubtitle: { ...textStyles.caption, marginTop: spacing.xxs }, // Example

  card: {
    backgroundColor: colors.surface,
    borderRadius: 12, // Consider a spacing value for border radius too
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    shadowColor: colors.text, // Or a specific shadow color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderIconWrapper: { flexDirection:'row', alignItems:'center', gap: spacing.xs, marginBottom: spacing.sm },
  cardTitle: { fontSize: textSizes.lg, fontWeight: fontWeights.semibold, color: colors.text },

  dashboardContainer: { gap: spacing.lg }, // Adjusted
  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: 16, // Consider spacing value
    padding: spacing.lg, // Adjusted
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  headerCardBackgroundCircle: { position: 'absolute', top: -60, right: -60, width: 150, height: 150, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 75 },
  headerRelative: { position: 'relative' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  headerGreeting: { fontSize: textSizes.xxl, fontWeight: fontWeights.bold, color: colors.textOnPrimary },
  headerTaskInfo: { opacity: 0.9, color: colors.indigo100, fontSize: textSizes.sm }, // indigo100 is specific, consider mapping to primaryBg or textOnPrimary variant
  headerStreakContainer: { alignItems: 'flex-end' },
  headerStreak: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xxs, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal:spacing.sm, paddingVertical: spacing.xxs, borderRadius: 20 },
  headerStreakText: { fontSize: textSizes.lg, fontWeight: fontWeights.bold, color: colors.textOnPrimary, marginLeft: spacing.xs },
  headerStreakSubText: { fontSize: textSizes.xs, opacity: 0.8, color: colors.textOnPrimary },
  headerStatsRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm }, // Adjusted
  headerStatItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  headerStatText: { fontSize: textSizes.sm, color: colors.textOnPrimary, fontWeight: fontWeights.medium },

  aiSuggestionCard: {
    backgroundColor: colors.primaryBg,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.indigo100, // specific, consider mapping
  },
  aiSuggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  aiSuggestionTitle: { fontWeight: fontWeights.semibold, color: colors.primary, fontSize: textSizes.md },
  aiSuggestionContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  aiSuggestionText: { fontWeight: fontWeights.medium, fontSize: textSizes.sm, color: colors.primary, flexShrink:1 },
  aiSuggestionDescription: { fontSize: textSizes.xs, color: colors.textSecondary, marginTop: spacing.xxs, flexShrink:1},
  aiSuggestionButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8 },
  aiSuggestionButtonText: { color: colors.textOnPrimary, fontSize: textSizes.xs, fontWeight: fontWeights.medium},

  quickNavGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  quickNavItem: {
    backgroundColor: colors.surface,
    paddingVertical:spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickNavIcon: {},
  quickNavText: { fontSize: textSizes.sm, fontWeight: fontWeights.medium, color: colors.slate700}, // slate700 specific, consider mapping
  quickNavCount: { fontSize: textSizes.xs, color: colors.textSecondary},

  taskList: { gap: spacing.sm },
  taskItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, backgroundColor: colors.background, borderRadius: 10 },
  taskDetails: { flex: 1, gap: spacing.xxs },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap:'wrap' },
  taskTime: { fontWeight: fontWeights.semibold, fontSize: textSizes.sm, color: colors.slate700 }, // specific
  taskText: { fontSize: textSizes.sm, color: colors.text },
  taskTextCompleted: { fontSize: textSizes.sm, color: colors.textLight, textDecorationLine: 'line-through' },

  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: 20, fontSize: textSizes.xs, fontWeight: fontWeights.medium, overflow: 'hidden'},
  categoryBadge: { backgroundColor: colors.primaryBg, color: colors.primary },
  categoryBadgeSmall: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs, borderRadius: 16, fontSize: 10, backgroundColor: colors.primaryBg, color: colors.primary },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, backgroundColor: colors.secondary, paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs, borderRadius:16 },
  aiBadgeSmall: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, backgroundColor: colors.secondary, paddingHorizontal: 6, paddingVertical: 3, borderRadius:12 }, // Adjusted padding
  aiBadgeText: { color: colors.textOnSecondary, fontSize: 10, fontWeight: fontWeights.medium},

  appointmentItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, backgroundColor: colors.success, borderRadius: 10 },
  appointmentTimeBlock: { width: 40, height: 40, backgroundColor: colors.surface, borderRadius: 8, justifyContent: 'center', alignItems: 'center'},
  appointmentTimeText: { color: colors.success, fontWeight: fontWeights.bold, fontSize:textSizes.md },
  appointmentDetails: { flex: 1, gap: spacing.xxs }, // Added gap for better text separation
  appointmentTitleText: { fontWeight: fontWeights.semibold, fontSize: textSizes.md, color: colors.textOnPrimary },
  appointmentSubText: { fontSize: textSizes.sm, color: colors.slate100 }, // specific, consider mapping
  appointmentMetaText: { fontSize: textSizes.xs, color: colors.slate200, marginTop: spacing.xxs }, // specific
  appointmentActions: { flexDirection: 'row', gap: spacing.xs },
  actionButton: { padding: spacing.xs, borderRadius: 8 },

  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryButtonText: { ...textStyles.button }, // Use textStyle
  primaryButtonSmall: { backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8 },
  primaryButtonSmallText: { color: colors.textOnPrimary, fontSize: textSizes.xs, fontWeight: fontWeights.medium },
  secondaryButton: {
    backgroundColor: colors.slate100, // specific
    paddingVertical: 10, // Consider spacing.sm - depends on exact size needed
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.slate300 // specific
  },
  secondaryButtonText: { color: colors.slate700, fontSize: textSizes.sm, fontWeight: fontWeights.medium, textAlign: 'center'}, // specific
  iconButton: { padding: spacing.sm, borderRadius: 20, backgroundColor: colors.slate100 }, // specific
  iconButtonSmall: { padding: spacing.xs, borderRadius: 16, backgroundColor: colors.slate100 }, // specific

  infoCard: { backgroundColor: colors.blue600, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.blue600 }, // blue600 specific
  infoCardTitle: { fontWeight: fontWeights.semibold, color: colors.textOnPrimary, marginBottom: spacing.sm, fontSize:textSizes.md },
  gridTwoCols: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap:spacing.sm },
  contactCard: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '48%'
  },
  contactAvatar: { fontSize: textSizes.xxl },
  contactName: { fontWeight: fontWeights.medium, fontSize: textSizes.sm, color: colors.text },
  contactActionText: { fontSize: textSizes.xs, color: colors.blue600 }, // blue600 specific

  listContainerScrollView: { flex:1 },
  listContainerNoGap: { },
  emptyListText: { textAlign:'center', color: colors.textSecondary, paddingVertical: spacing.lg, fontSize: textSizes.sm},
  listItemCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom:spacing.sm,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  listItemTitle: { fontWeight: fontWeights.semibold, fontSize:textSizes.md, color: colors.text },
  listItemSubtitle: { fontSize: textSizes.sm, color: colors.textSecondary, marginTop: spacing.xxs },
  listItemTiming: { alignItems: 'flex-end' },
  listItemDate: { fontWeight: fontWeights.medium, fontSize: textSizes.sm, color: colors.slate700 }, // specific
  listItemTime: { fontSize: textSizes.sm, color: colors.textSecondary },
  listItemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  listItemMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex:1, flexWrap:'wrap' },
  listItemLocation: { fontSize: textSizes.sm, color: colors.textSecondary },
  badgeSuccess: { backgroundColor: colors.success, color: colors.textOnPrimary },
  badgeWarning: { backgroundColor: colors.warning, color: colors.textOnPrimary }, // Assuming text on warning is primary (white)
  listItemActions: { flexDirection: 'row', gap: spacing.md },

  challengeItem: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, marginBottom:spacing.md },
  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  challengeTitle: { fontWeight: fontWeights.semibold, fontSize:textSizes.md, flex:1, marginRight:spacing.xs, color: colors.text },
  challengeParticipants: { fontSize: textSizes.sm, color: colors.textSecondary },
  challengeTiming: { alignItems: 'flex-end' },
  challengeDaysLeft: { fontSize: textSizes.sm, fontWeight: fontWeights.medium, color: colors.warning },
  challengeReward: { fontSize: textSizes.xs, color: colors.textLight, marginTop: spacing.xxs },
  challengeProgressContainer: { marginBottom: spacing.sm },
  challengeProgressTextContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xxs },
  challengeProgressLabel: {fontSize: textSizes.sm, color: colors.slate700}, // specific
  challengeProgressPercent: {fontSize: textSizes.sm, fontWeight: fontWeights.semibold, color: colors.text},
  challengeProgressBarBackground: { width: '100%', backgroundColor: colors.border, borderRadius: 999, height: 8 },
  challengeProgressBar: { backgroundColor: colors.warning, height: 8, borderRadius: 999 },
  challengeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop:spacing.sm },
  avatarGroup: { flexDirection: 'row' },
  avatarSmall: { width: 24, height: 24, backgroundColor: colors.primary, borderRadius: 12, borderWidth: 1.5, borderColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: -10 },
  avatarSmallMore: { width: 24, height: 24, backgroundColor: colors.textSecondary, borderRadius: 12, borderWidth: 1.5, borderColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: -10 },
  avatarText: { fontSize: 10, color: colors.textOnPrimary, fontWeight:fontWeights.bold }, // Assuming avatar bg is primary or similar
  linkText: { color: colors.primary, fontSize: textSizes.sm, fontWeight: fontWeights.medium },
  joinChallengeButton: { backgroundColor: colors.secondary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 }, // padding needs review against spacing scale
  joinChallengeButtonText: { color: colors.textOnSecondary, fontSize: textSizes.sm, fontWeight: fontWeights.semibold },
  challengeDetails: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, flexWrap:'wrap' },
  challengeDetailText: { fontSize: textSizes.sm, color: colors.textSecondary },

  tabsContainer: { flexDirection: 'row', gap: spacing.xxs, backgroundColor: colors.slate100, borderRadius: 10, padding: spacing.xxs}, // slate100 specific
  tabItem: { flex: 1, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8 }, // padding needs review
  tabItemActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  tabText: { textAlign: 'center', fontSize: textSizes.sm, fontWeight: fontWeights.semibold, color: colors.textSecondary },
  tabTextActive: { color: colors.primary },

  friendItemOnline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.sm, backgroundColor: colors.success, borderRadius: 10, marginBottom:spacing.sm },
  friendItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.sm, backgroundColor: colors.background, borderRadius: 10, marginBottom:spacing.sm },
  friendInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatarContainer: { position: 'relative' },
  avatarLg: { fontSize: 32 },
  statusIndicator: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.surface },
  statusIndicatorOnline: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.success, backgroundColor: colors.surface }, // Check border color logic
  statusOnline: { backgroundColor: colors.success },
  statusBusy: { backgroundColor: colors.warning },
  statusOffline: { backgroundColor: colors.textLight },
  friendName: { fontWeight: fontWeights.semibold, fontSize: textSizes.md, color: colors.text },
  friendMeta: { fontSize: textSizes.sm, color: colors.textSecondary },
  friendActions: { flexDirection: 'row', gap: spacing.sm },

  templateItem: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, marginBottom:spacing.md },
  templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  templateInfo: { flex: 1 },
  templateTitleContainer: {flexDirection:'row', alignItems:'center', flexWrap:'wrap', gap:spacing.xs, marginBottom:spacing.xxs},
  templateTitle: { fontWeight: fontWeights.semibold, fontSize: textSizes.md, color: colors.text },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, backgroundColor: colors.warning, paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs, borderRadius:16 },
  premiumBadgeText: { color: colors.textOnPrimary, fontSize: 10, fontWeight:fontWeights.bold }, // Assuming text on warning is primary
  templateAuthor: { fontSize: textSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  templateMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs, flexWrap:'wrap'},
  templateMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, fontSize: textSizes.sm, color: colors.textLight },
  templateActions: { flexDirection: 'column', gap: spacing.xs, alignItems:'flex-end' },
  premiumButtonSmall: { backgroundColor: colors.warning, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 }, // padding needs review

  emptyStateContainer: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyStateText: { fontSize: textSizes.sm, color: colors.textSecondary },

  groupProfileCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, alignItems: 'center', width: '48%', gap: spacing.xs },
  groupProfileIconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xxs},
  groupProfileName: { fontWeight: fontWeights.semibold, fontSize:textSizes.md, color: colors.text },
  groupProfileMembers: { fontSize: textSizes.xs, color: colors.textLight, marginBottom: spacing.xs },

  interestGroupItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.background, borderRadius: 10, marginBottom:spacing.sm },
  interestGroupName: { fontWeight: fontWeights.semibold, fontSize:textSizes.md, color: colors.text },
  interestGroupMeta: { fontSize: textSizes.sm, color: colors.textSecondary, marginTop: spacing.xxs },
  memberButton: { backgroundColor: colors.success, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }, // padding needs review
  memberButtonText: { color: colors.textOnPrimary, fontSize: textSizes.sm, fontWeight: fontWeights.medium },

  aiHeaderIconContainer: { backgroundColor: colors.primaryBg, padding:spacing.sm, borderRadius: 24 },
  aiPerformanceCard: { backgroundColor: colors.primary, borderRadius: 16, padding: spacing.lg, marginBottom:spacing.md },
  aiPerformanceTitle: { fontSize: textSizes.lg, fontWeight: fontWeights.bold, color: colors.textOnPrimary, marginBottom: spacing.md },
  aiPerformanceGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  aiPerformanceValue: { fontSize: textSizes.xxxl, fontWeight: fontWeights.bold, color: colors.textOnPrimary },
  aiPerformanceLabel: { fontSize: textSizes.sm, opacity: 0.9, color: colors.indigo100, marginTop:spacing.xxs }, // indigo100 specific

  suggestionItem: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, marginBottom:spacing.md },
  suggestionHeader: { marginBottom: spacing.sm },
  suggestionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs, marginBottom: spacing.xxs, flexWrap:'wrap'},
  suggestionTitle: { fontWeight: fontWeights.semibold, fontSize:textSizes.md, color: colors.text, flex:1 },
  badgeImpactHigh: { backgroundColor: colors.error, color: colors.textOnError},
  badgeImpactMedium: { backgroundColor: colors.warning, color: colors.textOnPrimary}, // Assuming text on warning is primary
  badgeImpactLow: { backgroundColor: colors.success, color: colors.textOnPrimary},
  suggestionDescription: { fontSize: textSizes.sm, color: colors.textSecondary, lineHeight:20 },
  applySuggestionButton: { backgroundColor: colors.secondary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignSelf:'flex-start', marginTop:spacing.sm, marginBottom:spacing.sm }, // padding needs review
  applySuggestionButtonText: { color: colors.textOnSecondary, fontSize: textSizes.sm, fontWeight: fontWeights.semibold },
  suggestionFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.slate100, paddingTop: spacing.sm, marginTop: spacing.xxs}, // slate100 specific
  suggestionType: { fontSize: textSizes.sm, color: colors.textLight, fontWeight: fontWeights.medium},
  suggestionSource: { fontSize: textSizes.sm, color: colors.primary, fontWeight: fontWeights.medium},

  predictionItemGreen: { padding: spacing.md, backgroundColor: colors.success, borderRadius: 10, marginBottom:spacing.sm},
  predictionTitleGreen: { fontWeight: fontWeights.semibold, color: colors.textOnPrimary, marginBottom:spacing.xxs, fontSize:textSizes.md},
  predictionDescriptionGreen: { fontSize: textSizes.sm, color: colors.slate100}, // specific
  predictionItemBlue: { padding: spacing.md, backgroundColor: colors.secondary, borderRadius: 10, marginBottom:spacing.sm},
  predictionTitleBlue: { fontWeight: fontWeights.semibold, color: colors.textOnSecondary, marginBottom:spacing.xxs, fontSize:textSizes.md},
  predictionDescriptionBlue: { fontSize: textSizes.sm, color: colors.slate100}, // specific
  predictionItemYellow: { padding: spacing.md, backgroundColor: colors.warning, borderRadius: 10, marginBottom:spacing.sm},
  predictionTitleYellow: { fontWeight: fontWeights.semibold, color: colors.textOnPrimary, marginBottom:spacing.xxs, fontSize:textSizes.md}, // Assuming text on warning is primary
  predictionDescriptionYellow: { fontSize: textSizes.sm, color: colors.slate100}, // specific

  coachingItem: { padding: spacing.md, backgroundColor: colors.background, borderRadius: 10, marginBottom:spacing.sm },
  coachingText: { fontSize: textSizes.sm, color: colors.slate700, lineHeight:22 }, // specific

  reminderItemCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom:spacing.sm},
  reminderDetails: { flex: 1, gap: spacing.xxs },
  reminderMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap:'wrap'},
  reminderTime: { fontWeight: fontWeights.semibold, fontSize:textSizes.md, color: colors.slate700 }, // slate800 was used, mapped to slate700 as textSecondary/text is too dark/light
  priorityHigh: { backgroundColor: colors.error, color: colors.textOnError},
  priorityMedium: { backgroundColor: colors.warning, color: colors.textOnPrimary}, // Assuming text on warning is primary
  priorityLow: { backgroundColor: colors.slate200, color: colors.slate700}, // specific
  reminderStreak: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, marginTop: spacing.xs },
  reminderStreakText: { fontSize: textSizes.sm, color: colors.textLight },
  reminderActions: { flexDirection: 'row', gap: spacing.md },

  profileSelectorGrid: { },
  profileCard: {
    padding: spacing.md, // Changed from spacing.lg
    borderRadius: 16,
    borderWidth: 1, // Changed from 2
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileCardContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profileIconContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  profileInfo: { flex: 1, gap: spacing.xs }, // Added gap: spacing.xs
  profileName: { fontWeight: fontWeights.bold, fontSize: textSizes.lg, marginBottom:spacing.xxs, color: colors.text },
  profileDescription: { fontSize: textSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs, lineHeight:20 },
  profileRoutinesPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  profileRoutinesMore: { fontSize: textSizes.xs, color: colors.textLight, marginTop:spacing.xxs },
});

