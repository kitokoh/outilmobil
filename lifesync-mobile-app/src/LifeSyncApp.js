import React, { useEffect, useState, useRef, useCallback } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Appearance } from 'react-native';
import { Bell, User, Calendar, Home, Settings, Users as UsersIcon, Brain, LogOut, Moon, Sun } from 'lucide-react-native';

import Dashboard from './components/Dashboard';
import AppointmentsView from './components/AppointmentsView';
import ChallengesView from './components/ChallengesView';
import CommunityView from './components/CommunityView';
import AiView from './components/AiView';
import AllReminders from './components/AllReminders';
import ProfileSelector from './components/ProfileSelector';
import LoginScreen from './components/LoginScreen';
import SettingsScreen from './components/SettingsScreen';
import RegistrationScreen from './components/RegistrationScreen';
import { DashboardSkeleton } from './components/SkeletonLoader';
import { getColors, getSystemColorScheme } from './theme';

import useStore from './store';

// --- Animated Bottom Nav Item ---
const AnimatedNavItem = ({ icon: Icon, label, isActive, onPress, activeColor, inactiveColor }) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1.15 : 1)).current;
  const dotAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1.15 : 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(dotAnim, {
        toValue: isActive ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive, scaleAnim, dotAnim]);

  return (
    <TouchableOpacity onPress={onPress} style={navItemStyle.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Icon size={22} color={isActive ? activeColor : inactiveColor} />
      </Animated.View>
      <Text style={[
        navItemStyle.label,
        { color: isActive ? activeColor : inactiveColor },
        isActive && { fontWeight: '700' },
      ]}>{label}</Text>
      <Animated.View style={[
        navItemStyle.dot,
        { backgroundColor: activeColor, opacity: dotAnim, transform: [{ scale: dotAnim }] },
      ]} />
    </TouchableOpacity>
  );
};

const navItemStyle = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, paddingVertical: 8, gap: 2 },
  label: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 3 },
});

// --- View Transition Wrapper ---
const ViewTransition = ({ children, viewKey }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(15);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [viewKey, fadeAnim, slideAnim]);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
};

const LifeSyncApp = () => {
  const { isAuthenticated, checkAuthState, user, currentView, setCurrentView, isDarkMode, toggleDarkMode, setDarkMode } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [authFlowView, setAuthFlowView] = useState('login');

  // Sync with system theme on mount
  useEffect(() => {
    setDarkMode(getSystemColorScheme());
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setDarkMode(colorScheme === 'dark');
    });
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, [setDarkMode]);

  useEffect(() => {
    const unsubscribe = checkAuthState();
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      clearTimeout(timer);
    };
  }, [checkAuthState]);

  // Generate theme-aware styles
  const currentColors = getColors(isDarkMode);
  const styles = createStyles(currentColors);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: currentColors.background }}>
        <DashboardSkeleton colors={currentColors} />
      </View>
    );
  }

  if (!isAuthenticated) {
    const mockNavigation = {
      navigate: (screenName) => {
        if (screenName === 'Registration') setAuthFlowView('register');
        else if (screenName === 'Login') setAuthFlowView('login');
      },
      goBack: () => setAuthFlowView('login'),
    };
    if (authFlowView === 'register') {
      return <RegistrationScreen navigation={mockNavigation} styles={styles} />;
    }
    return <LoginScreen navigation={mockNavigation} styles={styles} />;
  }

  const { logout, notifications } = useStore.getState();

  const navItems = [
    { key: 'dashboard', icon: Home, label: 'Accueil' },
    { key: 'reminders', icon: Calendar, label: 'Rappels' },
    { key: 'community', icon: UsersIcon, label: 'Social' },
    { key: 'ai', icon: Brain, label: 'IA Coach' },
    { key: 'settings', icon: Settings, label: 'Plus' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>LifeSync</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={toggleDarkMode} style={styles.iconButtonHeader}>
                {isDarkMode
                  ? <Sun size={22} color={currentColors.amber500} />
                  : <Moon size={22} color={currentColors.textSecondary} />
                }
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButtonHeader}>
                <Bell size={24} color={currentColors.textSecondary} />
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
                <User size={18} color={currentColors.textOnPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={logout} style={styles.iconButtonHeader}>
                <LogOut size={24} color={currentColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <ViewTransition viewKey={currentView}>
            {currentView === 'dashboard' && <Dashboard styles={styles} />}
            {currentView === 'reminders' && <AllReminders styles={styles} />}
            {currentView === 'appointments' && <AppointmentsView styles={styles} />}
            {currentView === 'challenges' && <ChallengesView styles={styles} />}
            {currentView === 'community' && <CommunityView styles={styles} />}
            {currentView === 'ai' && <AiView styles={styles} />}
            {currentView === 'profile' && <ProfileSelector styles={styles} />}
            {currentView === 'settings' && <SettingsScreen styles={styles} />}
          </ViewTransition>
        </View>
      </ScrollView>

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavContent}>
          {navItems.map((item) => (
            <AnimatedNavItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              isActive={currentView === item.key}
              onPress={() => setCurrentView(item.key)}
              activeColor={currentColors.primary}
              inactiveColor={currentColors.textLight}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LifeSyncApp;

// --- Style factory: generates all styles based on current color theme ---
const createStyles = (colors) => {
  const textSizes = {
    xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 30, xxxxl: 36,
  };

  const fontWeights = {
    light: '300', regular: '400', medium: '500', semibold: '600', bold: '700',
  };

  const spacing = {
    xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48,
  };

  const textStyles = {
    h1: { fontSize: textSizes.xxxxl, fontWeight: fontWeights.bold, color: colors.text },
    h2: { fontSize: textSizes.xxxl, fontWeight: fontWeights.bold, color: colors.text },
    h3: { fontSize: textSizes.xxl, fontWeight: fontWeights.semibold, color: colors.text },
    body: { fontSize: textSizes.md, fontWeight: fontWeights.regular, color: colors.text },
    caption: { fontSize: textSizes.sm, fontWeight: fontWeights.regular, color: colors.textSecondary },
    button: { fontSize: textSizes.md, fontWeight: fontWeights.medium, color: colors.textOnPrimary },
  };

  const generatedStyles = StyleSheet.create({
    // --- Expose tokens for child components ---
    // (accessed as styles.colors, styles.spacing, etc.)

    safeArea: { flex: 1, backgroundColor: colors.background },
    scrollViewContent: { flexGrow: 1 },
    contentContainer: { padding: spacing.md, paddingBottom: spacing.lg + spacing.md },

    headerContainer: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: textSizes.xl, fontWeight: fontWeights.bold, color: colors.primary },
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
      alignItems: 'center',
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
      paddingBottom: spacing.xs,
      paddingTop: spacing.xxs,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    bottomNavContent: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    bottomNavItem: { alignItems: 'center', flex: 1, paddingVertical: spacing.xs, gap: spacing.xxs },
    bottomNavText: { fontSize: textSizes.xs, fontWeight: fontWeights.medium },

    viewContainer: { padding: spacing.md, flex: 1, gap: spacing.lg },
    viewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
    viewTitle: { ...textStyles.h3, color: colors.text },
    viewSubtitle: { ...textStyles.caption, marginTop: spacing.xxs },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    cardHeaderIconWrapper: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
    cardTitle: { fontSize: textSizes.lg, fontWeight: fontWeights.semibold, color: colors.text },

    dashboardContainer: { gap: spacing.lg },
    headerCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: spacing.lg,
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
    headerTaskInfo: { opacity: 0.9, color: colors.indigo100, fontSize: textSizes.sm },
    headerStreakContainer: { alignItems: 'flex-end' },
    headerStreak: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xxs, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: 20 },
    headerStreakText: { fontSize: textSizes.lg, fontWeight: fontWeights.bold, color: colors.textOnPrimary, marginLeft: spacing.xs },
    headerStreakSubText: { fontSize: textSizes.xs, opacity: 0.8, color: colors.textOnPrimary },
    headerStatsRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
    headerStatItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    headerStatText: { fontSize: textSizes.sm, color: colors.textOnPrimary, fontWeight: fontWeights.medium },

    aiSuggestionCard: {
      backgroundColor: colors.primaryBg,
      borderRadius: 12,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.indigo100,
    },
    aiSuggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
    aiSuggestionTitle: { fontWeight: fontWeights.semibold, color: colors.primary, fontSize: textSizes.md },
    aiSuggestionContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
    aiSuggestionText: { fontWeight: fontWeights.medium, fontSize: textSizes.sm, color: colors.primary, flexShrink: 1 },
    aiSuggestionDescription: { fontSize: textSizes.xs, color: colors.textSecondary, marginTop: spacing.xxs, flexShrink: 1 },
    aiSuggestionButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8 },
    aiSuggestionButtonText: { color: colors.textOnPrimary, fontSize: textSizes.xs, fontWeight: fontWeights.medium },

    quickNavGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
    quickNavItem: {
      backgroundColor: colors.surface,
      paddingVertical: spacing.md,
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
    quickNavText: { fontSize: textSizes.sm, fontWeight: fontWeights.medium, color: colors.slate700 },
    quickNavCount: { fontSize: textSizes.xs, color: colors.textSecondary },

    taskList: { gap: spacing.sm },
    taskItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, backgroundColor: colors.background, borderRadius: 10 },
    taskDetails: { flex: 1, gap: spacing.xxs },
    taskMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
    taskTime: { fontWeight: fontWeights.semibold, fontSize: textSizes.sm, color: colors.slate700 },
    taskText: { fontSize: textSizes.sm, color: colors.text },
    taskTextCompleted: { fontSize: textSizes.sm, color: colors.textLight, textDecorationLine: 'line-through' },

    badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: 20, fontSize: textSizes.xs, fontWeight: fontWeights.medium, overflow: 'hidden' },
    categoryBadge: { backgroundColor: colors.primaryBg, color: colors.primary },
    categoryBadgeSmall: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs, borderRadius: 16, fontSize: 10, backgroundColor: colors.primaryBg, color: colors.primary },
    aiBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, backgroundColor: colors.secondary, paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs, borderRadius: 16 },
    aiBadgeSmall: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, backgroundColor: colors.secondary, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 12 },
    aiBadgeText: { color: colors.textOnSecondary, fontSize: 10, fontWeight: fontWeights.medium },

    appointmentItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, backgroundColor: colors.success, borderRadius: 10 },
    appointmentTimeBlock: { width: 40, height: 40, backgroundColor: colors.surface, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    appointmentTimeText: { color: colors.success, fontWeight: fontWeights.bold, fontSize: textSizes.md },
    appointmentDetails: { flex: 1, gap: spacing.xxs },
    appointmentTitleText: { fontWeight: fontWeights.semibold, fontSize: textSizes.md, color: colors.textOnPrimary },
    appointmentSubText: { fontSize: textSizes.sm, color: colors.slate100 },
    appointmentMetaText: { fontSize: textSizes.xs, color: colors.slate200, marginTop: spacing.xxs },
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
    primaryButtonText: { ...textStyles.button },
    primaryButtonSmall: { backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8 },
    primaryButtonSmallText: { color: colors.textOnPrimary, fontSize: textSizes.xs, fontWeight: fontWeights.medium },
    secondaryButton: {
      backgroundColor: colors.slate100,
      paddingVertical: 10,
      borderRadius: 10,
      width: '100%',
      borderWidth: 1,
      borderColor: colors.slate300,
    },
    secondaryButtonText: { color: colors.slate700, fontSize: textSizes.sm, fontWeight: fontWeights.medium, textAlign: 'center' },
    iconButton: { padding: spacing.sm, borderRadius: 20, backgroundColor: colors.slate100 },
    iconButtonSmall: { padding: spacing.xs, borderRadius: 16, backgroundColor: colors.slate100 },

    infoCard: { backgroundColor: colors.blue600, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.blue600 },
    infoCardTitle: { fontWeight: fontWeights.semibold, color: colors.textOnPrimary, marginBottom: spacing.sm, fontSize: textSizes.md },
    gridTwoCols: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.sm },
    contactCard: {
      backgroundColor: colors.surface,
      padding: spacing.sm,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      width: '48%',
    },
    contactAvatar: { fontSize: textSizes.xxl },
    contactName: { fontWeight: fontWeights.medium, fontSize: textSizes.sm, color: colors.text },
    contactActionText: { fontSize: textSizes.xs, color: colors.blue600 },

    listContainerScrollView: { flex: 1 },
    listContainerNoGap: {},
    emptyListText: { textAlign: 'center', color: colors.textSecondary, paddingVertical: spacing.lg, fontSize: textSizes.sm },
    listItemCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    listItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
    listItemTitle: { fontWeight: fontWeights.semibold, fontSize: textSizes.md, color: colors.text },
    listItemSubtitle: { fontSize: textSizes.sm, color: colors.textSecondary, marginTop: spacing.xxs },
    listItemTiming: { alignItems: 'flex-end' },
    listItemDate: { fontWeight: fontWeights.medium, fontSize: textSizes.sm, color: colors.slate700 },
    listItemTime: { fontSize: textSizes.sm, color: colors.textSecondary },
    listItemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
    listItemMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1, flexWrap: 'wrap' },
    listItemLocation: { fontSize: textSizes.sm, color: colors.textSecondary },
    badgeSuccess: { backgroundColor: colors.success, color: colors.textOnPrimary },
    badgeWarning: { backgroundColor: colors.warning, color: colors.textOnPrimary },
    listItemActions: { flexDirection: 'row', gap: spacing.md },

    challengeItem: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md },
    challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
    challengeTitle: { fontWeight: fontWeights.semibold, fontSize: textSizes.md, flex: 1, marginRight: spacing.xs, color: colors.text },
    challengeParticipants: { fontSize: textSizes.sm, color: colors.textSecondary },
    challengeTiming: { alignItems: 'flex-end' },
    challengeDaysLeft: { fontSize: textSizes.sm, fontWeight: fontWeights.medium, color: colors.warning },
    challengeReward: { fontSize: textSizes.xs, color: colors.textLight, marginTop: spacing.xxs },
    challengeProgressContainer: { marginBottom: spacing.sm },
    challengeProgressTextContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xxs },
    challengeProgressLabel: { fontSize: textSizes.sm, color: colors.slate700 },
    challengeProgressPercent: { fontSize: textSizes.sm, fontWeight: fontWeights.semibold, color: colors.text },
    challengeProgressBarBackground: { width: '100%', backgroundColor: colors.border, borderRadius: 999, height: 8 },
    challengeProgressBar: { backgroundColor: colors.warning, height: 8, borderRadius: 999 },
    challengeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
    avatarGroup: { flexDirection: 'row' },
    avatarSmall: { width: 24, height: 24, backgroundColor: colors.primary, borderRadius: 12, borderWidth: 1.5, borderColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: -10 },
    avatarSmallMore: { width: 24, height: 24, backgroundColor: colors.textSecondary, borderRadius: 12, borderWidth: 1.5, borderColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: -10 },
    avatarText: { fontSize: 10, color: colors.textOnPrimary, fontWeight: fontWeights.bold },
    linkText: { color: colors.primary, fontSize: textSizes.sm, fontWeight: fontWeights.medium },
    joinChallengeButton: { backgroundColor: colors.secondary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
    joinChallengeButtonText: { color: colors.textOnSecondary, fontSize: textSizes.sm, fontWeight: fontWeights.semibold },
    challengeDetails: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
    challengeDetailText: { fontSize: textSizes.sm, color: colors.textSecondary },

    tabsContainer: { flexDirection: 'row', gap: spacing.xxs, backgroundColor: colors.slate100, borderRadius: 10, padding: spacing.xxs },
    tabItem: { flex: 1, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8 },
    tabItemActive: {
      backgroundColor: colors.surface,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    tabText: { textAlign: 'center', fontSize: textSizes.sm, fontWeight: fontWeights.semibold, color: colors.textSecondary },
    tabTextActive: { color: colors.primary },

    friendItemOnline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.sm, backgroundColor: colors.success, borderRadius: 10, marginBottom: spacing.sm },
    friendItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.sm, backgroundColor: colors.background, borderRadius: 10, marginBottom: spacing.sm },
    friendInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    avatarContainer: { position: 'relative' },
    avatarLg: { fontSize: 32 },
    statusIndicator: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.surface },
    statusIndicatorOnline: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.success, backgroundColor: colors.surface },
    statusOnline: { backgroundColor: colors.success },
    statusBusy: { backgroundColor: colors.warning },
    statusOffline: { backgroundColor: colors.textLight },
    friendName: { fontWeight: fontWeights.semibold, fontSize: textSizes.md, color: colors.text },
    friendMeta: { fontSize: textSizes.sm, color: colors.textSecondary },
    friendActions: { flexDirection: 'row', gap: spacing.sm },

    templateItem: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md },
    templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
    templateInfo: { flex: 1 },
    templateTitleContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xxs },
    templateTitle: { fontWeight: fontWeights.semibold, fontSize: textSizes.md, color: colors.text },
    premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, backgroundColor: colors.warning, paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs, borderRadius: 16 },
    premiumBadgeText: { color: colors.textOnPrimary, fontSize: 10, fontWeight: fontWeights.bold },
    templateAuthor: { fontSize: textSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs },
    templateMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs, flexWrap: 'wrap' },
    templateMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, fontSize: textSizes.sm, color: colors.textLight },
    templateActions: { flexDirection: 'column', gap: spacing.xs, alignItems: 'flex-end' },
    premiumButtonSmall: { backgroundColor: colors.warning, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },

    emptyStateContainer: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
    emptyStateText: { fontSize: textSizes.sm, color: colors.textSecondary },

    groupProfileCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, alignItems: 'center', width: '48%', gap: spacing.xs },
    groupProfileIconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xxs },
    groupProfileName: { fontWeight: fontWeights.semibold, fontSize: textSizes.md, color: colors.text },
    groupProfileMembers: { fontSize: textSizes.xs, color: colors.textLight, marginBottom: spacing.xs },

    interestGroupItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.background, borderRadius: 10, marginBottom: spacing.sm },
    interestGroupName: { fontWeight: fontWeights.semibold, fontSize: textSizes.md, color: colors.text },
    interestGroupMeta: { fontSize: textSizes.sm, color: colors.textSecondary, marginTop: spacing.xxs },
    memberButton: { backgroundColor: colors.success, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    memberButtonText: { color: colors.textOnPrimary, fontSize: textSizes.sm, fontWeight: fontWeights.medium },

    aiHeaderIconContainer: { backgroundColor: colors.primaryBg, padding: spacing.sm, borderRadius: 24 },
    aiPerformanceCard: { backgroundColor: colors.primary, borderRadius: 16, padding: spacing.lg, marginBottom: spacing.md },
    aiPerformanceTitle: { fontSize: textSizes.lg, fontWeight: fontWeights.bold, color: colors.textOnPrimary, marginBottom: spacing.md },
    aiPerformanceGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    aiPerformanceValue: { fontSize: textSizes.xxxl, fontWeight: fontWeights.bold, color: colors.textOnPrimary },
    aiPerformanceLabel: { fontSize: textSizes.sm, opacity: 0.9, color: colors.indigo100, marginTop: spacing.xxs },

    suggestionItem: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md },
    suggestionHeader: { marginBottom: spacing.sm },
    suggestionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs, marginBottom: spacing.xxs, flexWrap: 'wrap' },
    suggestionTitle: { fontWeight: fontWeights.semibold, fontSize: textSizes.md, color: colors.text, flex: 1 },
    badgeImpactHigh: { backgroundColor: colors.error, color: colors.textOnError },
    badgeImpactMedium: { backgroundColor: colors.warning, color: colors.textOnPrimary },
    badgeImpactLow: { backgroundColor: colors.success, color: colors.textOnPrimary },
    suggestionDescription: { fontSize: textSizes.sm, color: colors.textSecondary, lineHeight: 20 },
    applySuggestionButton: { backgroundColor: colors.secondary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignSelf: 'flex-start', marginTop: spacing.sm, marginBottom: spacing.sm },
    applySuggestionButtonText: { color: colors.textOnSecondary, fontSize: textSizes.sm, fontWeight: fontWeights.semibold },
    suggestionFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.slate100, paddingTop: spacing.sm, marginTop: spacing.xxs },
    suggestionType: { fontSize: textSizes.sm, color: colors.textLight, fontWeight: fontWeights.medium },
    suggestionSource: { fontSize: textSizes.sm, color: colors.primary, fontWeight: fontWeights.medium },

    predictionItemGreen: { padding: spacing.md, backgroundColor: colors.success, borderRadius: 10, marginBottom: spacing.sm },
    predictionTitleGreen: { fontWeight: fontWeights.semibold, color: colors.textOnPrimary, marginBottom: spacing.xxs, fontSize: textSizes.md },
    predictionDescriptionGreen: { fontSize: textSizes.sm, color: colors.slate100 },
    predictionItemBlue: { padding: spacing.md, backgroundColor: colors.secondary, borderRadius: 10, marginBottom: spacing.sm },
    predictionTitleBlue: { fontWeight: fontWeights.semibold, color: colors.textOnSecondary, marginBottom: spacing.xxs, fontSize: textSizes.md },
    predictionDescriptionBlue: { fontSize: textSizes.sm, color: colors.slate100 },
    predictionItemYellow: { padding: spacing.md, backgroundColor: colors.warning, borderRadius: 10, marginBottom: spacing.sm },
    predictionTitleYellow: { fontWeight: fontWeights.semibold, color: colors.textOnPrimary, marginBottom: spacing.xxs, fontSize: textSizes.md },
    predictionDescriptionYellow: { fontSize: textSizes.sm, color: colors.slate100 },

    coachingItem: { padding: spacing.md, backgroundColor: colors.background, borderRadius: 10, marginBottom: spacing.sm },
    coachingText: { fontSize: textSizes.sm, color: colors.slate700, lineHeight: 22 },

    reminderItemCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
    reminderDetails: { flex: 1, gap: spacing.xxs },
    reminderMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
    reminderTime: { fontWeight: fontWeights.semibold, fontSize: textSizes.md, color: colors.slate700 },
    priorityHigh: { backgroundColor: colors.error, color: colors.textOnError },
    priorityMedium: { backgroundColor: colors.warning, color: colors.textOnPrimary },
    priorityLow: { backgroundColor: colors.slate200, color: colors.slate700 },
    reminderStreak: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, marginTop: spacing.xs },
    reminderStreakText: { fontSize: textSizes.sm, color: colors.textLight },
    reminderActions: { flexDirection: 'row', gap: spacing.md },

    profileSelectorGrid: {},
    profileCard: {
      padding: spacing.md,
      borderRadius: 16,
      borderWidth: 1,
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
    profileInfo: { flex: 1, gap: spacing.xs },
    profileName: { fontWeight: fontWeights.bold, fontSize: textSizes.lg, marginBottom: spacing.xxs, color: colors.text },
    profileDescription: { fontSize: textSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs, lineHeight: 20 },
    profileRoutinesPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    profileRoutinesMore: { fontSize: textSizes.xs, color: colors.textLight, marginTop: spacing.xxs },

    // Legacy compat references used by some child components
    textSlate600: { color: colors.textSecondary },
    textSlate400: { color: colors.textLight },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  });

  // Attach tokens so child components can access them via styles.colors, etc.
  generatedStyles.colors = colors;
  generatedStyles.spacing = spacing;
  generatedStyles.textSizes = textSizes;
  generatedStyles.fontWeights = fontWeights;
  generatedStyles.textStyles = textStyles;

  return generatedStyles;
};
