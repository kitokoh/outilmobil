import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'; // StyleSheet removed
import { Plus, CheckCircle, Circle, Sparkles, Star, Edit3, Trash2 } from 'lucide-react-native';
import useStore from '../store'; // Adjusted path

const AllReminders = ({ styles }) => { // Removed props now coming from store
  const reminders = useStore((state) => state.reminders);
  const toggleReminderCompleted = useStore((state) => state.toggleReminderCompleted);
  // Consider adding actions for adding/editing/deleting reminders

  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Mes Rappels</Text>
        <TouchableOpacity style={[styles.iconButton, {backgroundColor: styles.colors.primary}]}>
          <Plus size={20} color={styles.colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.listContainerScrollView}>
        {reminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderItemCard}>
            <TouchableOpacity onPress={() => toggleReminderCompleted(reminder.id)}>
              {reminder.completed ? <CheckCircle size={24} color={styles.colors.success} /> : <Circle size={24} color={styles.colors.textLight} />}
            </TouchableOpacity>
            <View style={styles.reminderDetails}>
              <View style={styles.reminderMeta}>
                <Text style={styles.reminderTime}>{reminder.time}</Text>
                {/* categoryBadge is themed (primaryBg, primary color) */}
                <Text style={[styles.badge, styles.categoryBadge]}>{reminder.category}</Text>
                {/* priorityHigh, Medium, Low are themed (error, warning, slate200+slate700) */}
                 <Text style={[styles.badge, 
                    reminder.priority === 'high' ? styles.priorityHigh :
                    reminder.priority === 'medium' ? styles.priorityMedium :
                    styles.priorityLow
                    // Ensure text colors are handled by these global styles (e.g. textOnError, textOnPrimary)
                  ]}>{reminder.priority}</Text>
                {reminder.aiOptimized && (
                  // aiBadgeSmall is themed (secondary color, textOnSecondary)
                  <View style={[styles.badge, styles.aiBadgeSmall]}>
                    <Sparkles size={12} color={styles.colors.textOnSecondary}/>
                    <Text style={styles.aiBadgeText}>IA</Text>
                  </View>
                )}
              </View>
              {/* taskTextCompleted and taskText are themed */}
              <Text style={reminder.completed ? styles.taskTextCompleted : styles.taskText}>{reminder.task}</Text>
              <View style={styles.reminderStreak}>
                <Star size={16} color={styles.colors.warning} />
                {/* reminderStreakText is themed (textLight) */}
                <Text style={styles.reminderStreakText}>Série de {reminder.streak} jours</Text>
              </View>
            </View>
            <View style={styles.reminderActions}>
              <TouchableOpacity><Edit3 size={16} color={styles.colors.textLight} /></TouchableOpacity>
              <TouchableOpacity><Trash2 size={16} color={styles.colors.error} /></TouchableOpacity>
            </View>
          </View>
        ))}
        {reminders.length === 0 && <Text style={styles.emptyListText}>Aucun rappel pour le moment.</Text>}
      </ScrollView>
    </View>
  );
};

export default AllReminders;
