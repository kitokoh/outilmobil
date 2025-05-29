import React, { useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Bell, User, Calendar, Home, Plus, Settings, Users as UsersIcon, Brain, LogOut } from 'lucide-react-native'; // Added LogOut icon

// Import components
import Dashboard from './components/Dashboard';
import AppointmentsView from './components/AppointmentsView';
import ChallengesView from './components/ChallengesView';
import CommunityView from './components/CommunityView';
import AiView from './components/AiView';
import AllReminders from './components/AllReminders';
import ProfileSelector from './components/ProfileSelector';
import LoginScreen from './components/LoginScreen'; // Import LoginScreen

// Import Zustand store
import useStore from './store';

const LifeSyncApp = () => {
  // Get state and actions from Zustand store
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const login = useStore((state) => state.login); // Though login is called from LoginScreen, keep for reference or future use
  const logout = useStore((state) => state.logout);
  const currentView = useStore((state) => state.currentView);
  const notifications = useStore((state) => state.notifications);
  const setCurrentView = useStore((state) => state.setCurrentView);
  const initializeProfileData = useStore((state) => state.initializeProfileData);
  const userProfile = useStore((state) => state.userProfile);

  useEffect(() => {
    // Initialize data when isAuthenticated or userProfile changes.
    // The store's initializeProfileData action already checks for isAuthenticated internally.
    // It also fetches public profileTemplates if not authenticated.
    initializeProfileData();
  }, [isAuthenticated, userProfile, initializeProfileData]);


  if (!isAuthenticated) {
    return <LoginScreen styles={styles} />; // Pass global styles to LoginScreen
  }

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
        </View>
      </ScrollView>
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavContent}>
          <TouchableOpacity onPress={() => setCurrentView('dashboard')} style={styles.bottomNavItem}>
            <Home size={22} color={currentView === 'dashboard' ? styles.textIndigo600.color : styles.textSlate400.color} />
            <Text style={[styles.bottomNavText, currentView === 'dashboard' ? styles.textIndigo600 : styles.textSlate400]}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentView('reminders')} style={styles.bottomNavItem}>
            <Calendar size={22} color={currentView === 'reminders' ? styles.textIndigo600.color : styles.textSlate400.color} />
            <Text style={[styles.bottomNavText, currentView === 'reminders' ? styles.textIndigo600 : styles.textSlate400]}>Rappels</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentView('community')} style={styles.bottomNavItem}>
            <UsersIcon size={22} color={currentView === 'community' ? styles.textIndigo600.color : styles.textSlate400.color} />
            <Text style={[styles.bottomNavText, currentView === 'community' ? styles.textIndigo600 : styles.textSlate400]}>Social</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentView('ai')} style={styles.bottomNavItem}>
            <Brain size={22} color={currentView === 'ai' ? styles.textIndigo600.color : styles.textSlate400.color} />
            <Text style={[styles.bottomNavText, currentView === 'ai' ? styles.textIndigo600 : styles.textSlate400]}>IA Coach</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavItem} onPress={() => { /* Define action for Plus/Settings */ }}>
            <Settings size={22} color={styles.textSlate400.color} />
            <Text style={[styles.bottomNavText, styles.textSlate400]}>Plus</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const textSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

const colors = {
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
  indigo600: '#4F46E5',
  sky500: '#0EA5E9',
  emerald500: '#10B981',
  amber500: '#F59E0B',
  red600: '#DC2626',
  orange600: '#EA580C', 
  pink600: '#DB2777',   
  gray700: '#374151',   
  blue600: '#2563EB',   
};

const styles = StyleSheet.create({
  textIndigo600: { color: colors.indigo600 },
  textSlate400: { color: colors.slate400 },
  textSlate600: { color: colors.slate600 },
  textSlate900: { color: colors.slate900 },
  textWhite: { color: colors.white },

  safeArea: { flex: 1, backgroundColor: colors.slate50 },
  scrollViewContent: { flexGrow: 1 },
  contentContainer: { padding: 16, paddingBottom: 76 }, 

  headerContainer: { 
    backgroundColor: colors.white, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.slate200, 
    paddingHorizontal: 16, 
    paddingTop: 12, 
    paddingBottom: 12,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: textSizes.xl, fontWeight: fontWeights.bold, color: colors.indigo600 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 8 }, 
  iconButtonHeader: { padding: 8 }, 
  notificationBell: { position: 'relative' }, 
  notificationBadge: { 
    position: 'absolute', 
    top: -4, right: -4, 
    backgroundColor: colors.red600, 
    borderRadius: 10, 
    width: 18, height: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  notificationText: { color: colors.white, fontSize: textSizes.xs, fontWeight: fontWeights.bold },
  userProfileButton: { 
    width: 36, height: 36, 
    backgroundColor: colors.indigo600, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: colors.indigo500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },

  bottomNavContainer: { 
    backgroundColor: colors.white, 
    borderTopWidth: 1, 
    borderTopColor: colors.slate200, 
    paddingBottom: 8, 
    paddingTop: 4,
    position: 'absolute', 
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavContent: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  bottomNavItem: { alignItems: 'center', flex: 1, paddingVertical: 6, gap: 2 }, 
  bottomNavText: { fontSize: textSizes.xs, fontWeight: fontWeights.medium },
  activeColor: { color: colors.indigo600 }, 
  inactiveColor: { color: colors.slate400 }, 

  viewContainer: { padding: 16, flex: 1, gap: 20 }, 
  viewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, 
  viewTitle: { fontSize: textSizes['2xl'], fontWeight: fontWeights.bold, color: colors.slate900 },
  viewSubtitle: { fontSize: textSizes.sm, color: colors.slate600, marginTop: 4 },
  
  card: { 
    backgroundColor: colors.white, 
    borderRadius: 12, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: colors.slate200, 
    marginBottom: 16,
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderIconWrapper: { flexDirection:'row', alignItems:'center', gap:8, marginBottom: 12 },
  cardTitle: { fontSize: textSizes.lg, fontWeight: fontWeights.semibold, color: colors.slate900 },

  dashboardContainer: { gap: 20 }, 
  headerCard: { 
    backgroundColor: colors.indigo600, 
    borderRadius: 16, 
    padding: 20, 
    position: 'relative', 
    overflow: 'hidden',
    shadowColor: colors.indigo500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  headerCardBackgroundCircle: { position: 'absolute', top: -60, right: -60, width: 150, height: 150, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 75 },
  headerRelative: { position: 'relative' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerGreeting: { fontSize: textSizes['2xl'], fontWeight: fontWeights.bold, color: colors.white },
  headerTaskInfo: { opacity: 0.9, color: colors.indigo100, fontSize: textSizes.sm },
  headerStreakContainer: { alignItems: 'flex-end' },
  headerStreak: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal:10, paddingVertical: 4, borderRadius: 20 },
  headerStreakText: { fontSize: textSizes.lg, fontWeight: fontWeights.bold, color: colors.white, marginLeft: 6 },
  headerStreakSubText: { fontSize: textSizes.xs, opacity: 0.8, color: colors.white },
  headerStatsRow: { flexDirection: 'row', gap: 20, marginTop: 12 },
  headerStatItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerStatText: { fontSize: textSizes.sm, color: colors.white, fontWeight: fontWeights.medium },

  aiSuggestionCard: { 
    backgroundColor: colors.indigo50, 
    borderRadius: 12, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: colors.indigo100, 
  },
  aiSuggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  aiSuggestionTitle: { fontWeight: fontWeights.semibold, color: colors.indigo600, fontSize: textSizes.base }, 
  aiSuggestionContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  aiSuggestionText: { fontWeight: fontWeights.medium, fontSize: textSizes.sm, color: colors.indigo600, flexShrink:1 },
  aiSuggestionDescription: { fontSize: textSizes.xs, color: colors.slate500, marginTop: 2, flexShrink:1}, 
  aiSuggestionButton: { backgroundColor: colors.indigo600, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  aiSuggestionButtonText: { color: colors.white, fontSize: textSizes.xs, fontWeight: fontWeights.medium},

  quickNavGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 }, 
  quickNavItem: { 
    backgroundColor: colors.white, 
    paddingVertical:16, 
    paddingHorizontal: 8,
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: colors.slate200, 
    alignItems: 'center', 
    flex: 1, 
    gap: 8, 
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickNavIcon: {}, 
  quickNavText: { fontSize: textSizes.sm, fontWeight: fontWeights.medium, color: colors.slate700},
  quickNavCount: { fontSize: textSizes.xs, color: colors.slate500},
  
  taskList: { gap: 12 },
  taskItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: colors.slate50, borderRadius: 10 },
  taskDetails: { flex: 1, gap: 2 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap:'wrap' },
  taskTime: { fontWeight: fontWeights.semibold, fontSize: textSizes.sm, color: colors.slate700 },
  taskText: { fontSize: textSizes.sm, color: colors.slate900 },
  taskTextCompleted: { fontSize: textSizes.sm, color: colors.slate500, textDecorationLine: 'line-through' },
  
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, fontSize: textSizes.xs, fontWeight: fontWeights.medium, overflow: 'hidden'}, 
  categoryBadge: { backgroundColor: colors.indigo100, color: colors.indigo600 }, 
  categoryBadgeSmall: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, fontSize: 10, backgroundColor: colors.indigo100, color: colors.indigo600 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.sky500, paddingHorizontal: 8, paddingVertical: 4, borderRadius:16 }, 
  aiBadgeSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.sky500, paddingHorizontal: 6, paddingVertical: 3, borderRadius:12 },
  aiBadgeText: { color: colors.white, fontSize: 10, fontWeight: fontWeights.medium}, 

  appointmentItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: colors.emerald500, borderRadius: 10 }, 
  appointmentTimeBlock: { width: 40, height: 40, backgroundColor: colors.white, borderRadius: 8, justifyContent: 'center', alignItems: 'center'}, 
  appointmentTimeText: { color: colors.emerald500, fontWeight: fontWeights.bold, fontSize:textSizes.base },
  appointmentDetails: { flex: 1 },
  appointmentTitleText: { fontWeight: fontWeights.semibold, fontSize: textSizes.base, color: colors.white },
  appointmentSubText: { fontSize: textSizes.sm, color: colors.slate100 },
  appointmentMetaText: { fontSize: textSizes.xs, color: colors.slate200, marginTop: 2 },
  appointmentActions: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 8, borderRadius: 8 }, 

  primaryButton: { 
    backgroundColor: colors.indigo600, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8,
    shadowColor: colors.indigo500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryButtonText: { color: colors.white, fontSize: textSizes.sm, fontWeight: fontWeights.semibold },
  primaryButtonSmall: { backgroundColor: colors.indigo600, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  primaryButtonSmallText: { color: colors.white, fontSize: textSizes.xs, fontWeight: fontWeights.medium },
  secondaryButton: { 
    backgroundColor: colors.slate100, 
    paddingVertical: 10, 
    borderRadius: 10, 
    width: '100%', 
    borderWidth: 1, 
    borderColor: colors.slate300 
  },
  secondaryButtonText: { color: colors.slate700, fontSize: textSizes.sm, fontWeight: fontWeights.medium, textAlign: 'center'},
  iconButton: { padding: 10, borderRadius: 20, backgroundColor: colors.slate100 }, 
  iconButtonSmall: { padding: 8, borderRadius: 16, backgroundColor: colors.slate100 },
  
  infoCard: { backgroundColor: colors.blue600, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.blue600 }, 
  infoCardTitle: { fontWeight: fontWeights.semibold, color: colors.white, marginBottom: 12, fontSize:textSizes.base }, 
  gridTwoCols: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap:10 },
  contactCard: { 
    backgroundColor: colors.white, 
    padding: 12, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: colors.slate200, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    width: '48%' 
  },
  contactAvatar: { fontSize: textSizes['2xl'] },
  contactName: { fontWeight: fontWeights.medium, fontSize: textSizes.sm, color: colors.slate900 },
  contactActionText: { fontSize: textSizes.xs, color: colors.blue600 }, 

  listContainerScrollView: { flex:1 }, 
  listContainerNoGap: { }, 
  emptyListText: { textAlign:'center', color: colors.slate500, paddingVertical: 24, fontSize: textSizes.sm},
  listItemCard: { 
    backgroundColor: colors.white, 
    borderRadius: 12, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: colors.slate200, 
    marginBottom:12, 
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }, 
  listItemTitle: { fontWeight: fontWeights.semibold, fontSize:textSizes.base, color: colors.slate900 },
  listItemSubtitle: { fontSize: textSizes.sm, color: colors.slate600, marginTop: 2 },
  listItemTiming: { alignItems: 'flex-end' },
  listItemDate: { fontWeight: fontWeights.medium, fontSize: textSizes.sm, color: colors.slate700 },
  listItemTime: { fontSize: textSizes.sm, color: colors.slate500 },
  listItemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }, 
  listItemMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flex:1, flexWrap:'wrap' },
  listItemLocation: { fontSize: textSizes.sm, color: colors.slate600 },
  badgeSuccess: { backgroundColor: colors.emerald500, color: colors.white }, 
  badgeWarning: { backgroundColor: colors.amber500, color: colors.white }, 
  listItemActions: { flexDirection: 'row', gap: 16 }, 
  
  challengeItem: { borderWidth: 1, borderColor: colors.slate200, borderRadius: 12, padding: 16, marginBottom:16 },
  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  challengeTitle: { fontWeight: fontWeights.semibold, fontSize:textSizes.base, flex:1, marginRight:8, color: colors.slate900 },
  challengeParticipants: { fontSize: textSizes.sm, color: colors.slate600 },
  challengeTiming: { alignItems: 'flex-end' },
  challengeDaysLeft: { fontSize: textSizes.sm, fontWeight: fontWeights.medium, color: colors.amber500 },
  challengeReward: { fontSize: textSizes.xs, color: colors.slate500, marginTop: 2 },
  challengeProgressContainer: { marginBottom: 12 },
  challengeProgressTextContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  challengeProgressLabel: {fontSize: textSizes.sm, color: colors.slate700},
  challengeProgressPercent: {fontSize: textSizes.sm, fontWeight: fontWeights.semibold, color: colors.slate900},
  challengeProgressBarBackground: { width: '100%', backgroundColor: colors.slate200, borderRadius: 999, height: 8 }, 
  challengeProgressBar: { backgroundColor: colors.amber500, height: 8, borderRadius: 999 },
  challengeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop:12 },
  avatarGroup: { flexDirection: 'row' },
  avatarSmall: { width: 24, height: 24, backgroundColor: colors.indigo500, borderRadius: 12, borderWidth: 1.5, borderColor: colors.white, justifyContent: 'center', alignItems: 'center', marginRight: -10 }, 
  avatarSmallMore: { width: 24, height: 24, backgroundColor: colors.slate500, borderRadius: 12, borderWidth: 1.5, borderColor: colors.white, justifyContent: 'center', alignItems: 'center', marginRight: -10 },
  avatarText: { fontSize: 10, color: colors.white, fontWeight:fontWeights.bold },
  linkText: { color: colors.indigo600, fontSize: textSizes.sm, fontWeight: fontWeights.medium },
  joinChallengeButton: { backgroundColor: colors.sky500, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 }, 
  joinChallengeButtonText: { color: colors.white, fontSize: textSizes.sm, fontWeight: fontWeights.semibold },
  challengeDetails: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, flexWrap:'wrap' },
  challengeDetailText: { fontSize: textSizes.sm, color: colors.slate600 },

  tabsContainer: { flexDirection: 'row', gap: 4, backgroundColor: colors.slate100, borderRadius: 10, padding: 4}, 
  tabItem: { flex: 1, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8 }, 
  tabItemActive: { 
    backgroundColor: colors.white, 
    shadowColor: colors.slate900, 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    elevation: 2 
  },
  tabText: { textAlign: 'center', fontSize: textSizes.sm, fontWeight: fontWeights.semibold, color: colors.slate600 },
  tabTextActive: { color: colors.indigo600 },

  friendItemOnline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: colors.emerald500, borderRadius: 10, marginBottom:12 }, 
  friendItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: colors.slate50, borderRadius: 10, marginBottom:12 },
  friendInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: { position: 'relative' },
  avatarLg: { fontSize: 32 }, 
  statusIndicator: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.white },
  statusIndicatorOnline: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.emerald500, backgroundColor: colors.white }, 
  statusOnline: { backgroundColor: colors.emerald500 },
  statusBusy: { backgroundColor: colors.amber500 },
  statusOffline: { backgroundColor: colors.slate400 },
  friendName: { fontWeight: fontWeights.semibold, fontSize: textSizes.base, color: colors.slate900 },
  friendMeta: { fontSize: textSizes.sm, color: colors.slate500 },
  friendActions: { flexDirection: 'row', gap: 12 },

  templateItem: { borderWidth: 1, borderColor: colors.slate200, borderRadius: 12, padding: 16, marginBottom:16 },
  templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }, 
  templateInfo: { flex: 1 },
  templateTitleContainer: {flexDirection:'row', alignItems:'center', flexWrap:'wrap', gap:8, marginBottom:4},
  templateTitle: { fontWeight: fontWeights.semibold, fontSize: textSizes.base, color: colors.slate900 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.amber500, paddingHorizontal: 8, paddingVertical: 4, borderRadius:16 },
  premiumBadgeText: { color: colors.white, fontSize: 10, fontWeight:fontWeights.bold },
  templateAuthor: { fontSize: textSizes.sm, color: colors.slate600, marginBottom: 6 },
  templateMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8, flexWrap:'wrap'},
  templateMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, fontSize: textSizes.sm, color: colors.slate500 },
  templateActions: { flexDirection: 'column', gap: 8, alignItems:'flex-end' }, 
  premiumButtonSmall: { backgroundColor: colors.amber500, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },

  emptyStateContainer: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  emptyStateText: { fontSize: textSizes.sm, color: colors.slate500 },

  groupProfileCard: { borderWidth: 1, borderColor: colors.slate200, borderRadius: 12, padding: 16, alignItems: 'center', width: '48%', gap: 8 },
  groupProfileIconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 4},
  groupProfileName: { fontWeight: fontWeights.semibold, fontSize:textSizes.base, color: colors.slate900 },
  groupProfileMembers: { fontSize: textSizes.xs, color: colors.slate500, marginBottom: 8 },

  interestGroupItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: colors.slate50, borderRadius: 10, marginBottom:12 },
  interestGroupName: { fontWeight: fontWeights.semibold, fontSize:textSizes.base, color: colors.slate900 },
  interestGroupMeta: { fontSize: textSizes.sm, color: colors.slate500, marginTop: 2 },
  memberButton: { backgroundColor: colors.emerald500, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  memberButtonText: { color: colors.white, fontSize: textSizes.sm, fontWeight: fontWeights.medium },
  
  aiHeaderIconContainer: { backgroundColor: colors.indigo50, padding:12, borderRadius: 24 }, 
  aiPerformanceCard: { backgroundColor: colors.indigo600, borderRadius: 16, padding: 20, marginBottom:16 }, 
  aiPerformanceTitle: { fontSize: textSizes.lg, fontWeight: fontWeights.bold, color: colors.white, marginBottom: 16 },
  aiPerformanceGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  aiPerformanceValue: { fontSize: textSizes['3xl'], fontWeight: fontWeights.bold, color: colors.white },
  aiPerformanceLabel: { fontSize: textSizes.sm, opacity: 0.9, color: colors.indigo100, marginTop:4 },
  
  suggestionItem: { borderWidth: 1, borderColor: colors.slate200, borderRadius: 12, padding: 16, marginBottom:16 },
  suggestionHeader: { marginBottom: 12 },
  suggestionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 4, flexWrap:'wrap'},
  suggestionTitle: { fontWeight: fontWeights.semibold, fontSize:textSizes.base, color: colors.slate900, flex:1 },
  badgeImpactHigh: { backgroundColor: colors.red600, color: colors.white},
  badgeImpactMedium: { backgroundColor: colors.amber500, color: colors.white},
  badgeImpactLow: { backgroundColor: colors.emerald500, color: colors.white},
  suggestionDescription: { fontSize: textSizes.sm, color: colors.slate600, lineHeight:20 },
  applySuggestionButton: { backgroundColor: colors.sky500, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignSelf:'flex-start', marginTop:12, marginBottom:12 },
  applySuggestionButtonText: { color: colors.white, fontSize: textSizes.sm, fontWeight: fontWeights.semibold },
  suggestionFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.slate100, paddingTop: 12, marginTop: 4},
  suggestionType: { fontSize: textSizes.sm, color: colors.slate500, fontWeight: fontWeights.medium},
  suggestionSource: { fontSize: textSizes.sm, color: colors.indigo600, fontWeight: fontWeights.medium},

  predictionItemGreen: { padding: 16, backgroundColor: colors.emerald500, borderRadius: 10, marginBottom:12},
  predictionTitleGreen: { fontWeight: fontWeights.semibold, color: colors.white, marginBottom:4, fontSize:textSizes.base},
  predictionDescriptionGreen: { fontSize: textSizes.sm, color: colors.slate100},
  predictionItemBlue: { padding: 16, backgroundColor: colors.sky500, borderRadius: 10, marginBottom:12},
  predictionTitleBlue: { fontWeight: fontWeights.semibold, color: colors.white, marginBottom:4, fontSize:textSizes.base},
  predictionDescriptionBlue: { fontSize: textSizes.sm, color: colors.slate100},
  predictionItemYellow: { padding: 16, backgroundColor: colors.amber500, borderRadius: 10, marginBottom:12},
  predictionTitleYellow: { fontWeight: fontWeights.semibold, color: colors.white, marginBottom:4, fontSize:textSizes.base},
  predictionDescriptionYellow: { fontSize: textSizes.sm, color: colors.slate100},

  coachingItem: { padding: 16, backgroundColor: colors.slate50, borderRadius: 10, marginBottom:12 },
  coachingText: { fontSize: textSizes.sm, color: colors.slate700, lineHeight:22 },
  
  reminderItemCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.slate200, marginBottom:12},
  reminderDetails: { flex: 1, gap: 4 },
  reminderMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap:'wrap'},
  reminderTime: { fontWeight: fontWeights.semibold, fontSize:textSizes.base, color: colors.slate800 },
  priorityHigh: { backgroundColor: colors.red600, color: colors.white},
  priorityMedium: { backgroundColor: colors.amber500, color: colors.white},
  priorityLow: { backgroundColor: colors.slate200, color: colors.slate700},
  reminderStreak: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  reminderStreakText: { fontSize: textSizes.sm, color: colors.slate500 },
  reminderActions: { flexDirection: 'row', gap: 16 },

  profileSelectorGrid: { }, 
  profileCard: { 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 2, 
    borderColor: colors.slate200, 
    backgroundColor: colors.white,
    marginBottom: 16, 
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileCardActive: { 
    borderColor: colors.indigo600, 
    backgroundColor: colors.indigo50,
    shadowColor: colors.indigo500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileCardContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  profileIconContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' }, 
  profileInfo: { flex: 1 },
  profileName: { fontWeight: fontWeights.bold, fontSize: textSizes.lg, marginBottom:4, color: colors.slate900 },
  profileDescription: { fontSize: textSizes.sm, color: colors.slate600, marginBottom: 8, lineHeight:20 },
  profileRoutinesPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  profileRoutinesMore: { fontSize: textSizes.xs, color: colors.slate500, marginTop:4 },
});

export default LifeSyncApp;
