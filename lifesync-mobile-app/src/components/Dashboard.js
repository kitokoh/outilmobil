import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native'; // StyleSheet removed, styles passed as prop
import { Star, Trophy, Users as UsersIcon, Brain, Sparkles, Calendar, Clock, Phone, Video, CheckCircle, Circle } from 'lucide-react-native';
import useStore from '../store'; // Adjusted path

const Dashboard = ({ styles }) => { // Removed props now coming from store
  const reminders = useStore((state) => state.reminders);
  const appointments = useStore((state) => state.appointments);
  const friends = useStore((state) => state.friends);
  const challenges = useStore((state) => state.challenges);
  const aiSuggestions = useStore((state) => state.aiSuggestions);
  const streak = useStore((state) => state.streak);
  const setCurrentView = useStore((state) => state.setCurrentView);
  const toggleReminderCompleted = useStore((state) => state.toggleReminderCompleted);

  return (
    <View style={styles.dashboardContainer}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerCardBackgroundCircle} />
        <View style={styles.headerRelative}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerGreeting}>Bonjour ! 👋</Text>
              <Text style={[styles.headerTaskInfo, {color: styles.colors.textOnPrimary, opacity: 0.9}]}>Vous avez {reminders.filter(r => !r.completed).length} tâches aujourd'hui</Text>
            </View>
            <View style={styles.headerStreakContainer}>
              <View style={styles.headerStreak}>
                <Star size={20} color={styles.colors.textOnPrimary} />
                <Text style={styles.headerStreakText}>{streak}</Text>
              </View>
              <Text style={[styles.headerStreakSubText, {color: styles.colors.textOnPrimary, opacity: 0.8}]}>jours de suite</Text>
            </View>
          </View>
          <View style={styles.headerStatsRow}>
            <View style={styles.headerStatItem}>
              <Trophy size={16} color={styles.colors.textOnPrimary} />
              <Text style={styles.headerStatText}>{challenges.filter(c => c.joined).length} défis actifs</Text>
            </View>
            <View style={styles.headerStatItem}>
              <UsersIcon size={16} color={styles.colors.textOnPrimary} />
              <Text style={styles.headerStatText}>{friends.length} amis</Text>
            </View>
          </View>
        </View>
      </View>

      {/* AI Suggestion Card */}
      <View style={styles.aiSuggestionCard}>
        <View style={styles.aiSuggestionHeader}>
          <Brain size={20} color={styles.colors.accent} /> {/* Updated color */}
          <Text style={styles.aiSuggestionTitle}>IA Coach Personnel</Text>
        </View>
        {aiSuggestions.slice(0, 1).map((suggestion) => (
          <View key={suggestion.id} style={styles.aiSuggestionContent}>
            <View style={{flexShrink: 1}}>
              <Text style={styles.aiSuggestionText}>{suggestion.title}</Text>
              <Text style={styles.aiSuggestionDescription}>{suggestion.description}</Text>
            </View>
            <TouchableOpacity style={styles.aiSuggestionButton}>
              <Text style={styles.aiSuggestionButtonText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Quick Navigation Grid */}
      <View style={styles.quickNavGrid}>
        <TouchableOpacity onPress={() => setCurrentView('appointments')} style={styles.quickNavItem}>
          <Calendar size={24} color={styles.colors.blue600} style={styles.quickNavIcon} /> {/* Example: blue600 defined in global colors */}
          <Text style={styles.quickNavText}>RDV</Text>
          <Text style={styles.quickNavCount}>{appointments.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentView('challenges')} style={styles.quickNavItem}>
          <Trophy size={24} color={styles.colors.amber500} style={styles.quickNavIcon} /> {/* amber500 is accent/warning */}
          <Text style={styles.quickNavText}>Défis</Text>
          <Text style={styles.quickNavCount}>{challenges.filter(c => c.joined).length}/{challenges.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentView('community')} style={styles.quickNavItem}>
          <UsersIcon size={24} color={styles.colors.emerald500} style={styles.quickNavIcon} /> {/* emerald500 is success */}
          <Text style={styles.quickNavText}>Communauté</Text>
          <Text style={styles.quickNavCount}>{friends.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentView('ai')} style={styles.quickNavItem}>
          <Sparkles size={24} color={styles.colors.pink600} style={styles.quickNavIcon} /> {/* Example: pink600 defined in global colors */}
          <Text style={styles.quickNavText}>IA</Text>
          <Text style={styles.quickNavCount}>{aiSuggestions.length}</Text>
        </TouchableOpacity>
      </View>

      {/* Task List Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderIconWrapper}><Clock size={20} color={styles.colors.primary} /><Text style={styles.cardTitle}> Prochaines tâches</Text></View>
        <View style={styles.taskList}>
          {reminders.slice(0, 4).map((reminder) => (
            <View key={reminder.id} style={styles.taskItem}>
              <TouchableOpacity onPress={() => toggleReminderCompleted(reminder.id)}>
                {reminder.completed ?
                  <CheckCircle size={20} color={styles.colors.success} /> :
                  <Circle size={20} color={styles.colors.textLight} />
                }
              </TouchableOpacity>
              <View style={styles.taskDetails}>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskTime}>{reminder.time}</Text>
                  <Text style={[styles.badge, styles.categoryBadge]}>{reminder.category}</Text>
                  {reminder.aiOptimized && (
                    <View style={[styles.badge, styles.aiBadge]}>
                      <Sparkles size={12} color={styles.colors.textOnSecondary} /> {/* AI badge text color is onSecondary */}
                      <Text style={styles.aiBadgeText}>IA</Text>
                    </View>
                  )}
                </View>
                <Text style={reminder.completed ? styles.taskTextCompleted : styles.taskText}>
                  {reminder.task}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Appointments Card (if any) */}
      {appointments.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeaderIconWrapper}><Calendar size={20} color={styles.colors.success} /><Text style={styles.cardTitle}> Prochain rendez-vous</Text></View>
          <View style={styles.appointmentItem}> {/* This style is defined in global styles */}
            <View style={styles.appointmentTimeBlock}>
              <Text style={styles.appointmentTimeText}>{appointments[0].time.split(':')[0]}</Text>
            </View>
            <View style={styles.appointmentDetails}>
              <Text style={styles.appointmentTitleText}>{appointments[0].title}</Text>
              <Text style={styles.appointmentSubText}>avec {appointments[0].with}</Text>
              <Text style={styles.appointmentMetaText}>{appointments[0].date} à {appointments[0].time}</Text>
            </View>
            <View style={styles.appointmentActions}>
              <TouchableOpacity style={[styles.actionButton, {backgroundColor: styles.colors.success}]}>
                <Phone size={16} color={styles.colors.textOnPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, {backgroundColor: styles.colors.secondary}]}>
                <Video size={16} color={styles.colors.textOnSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
export default Dashboard;
