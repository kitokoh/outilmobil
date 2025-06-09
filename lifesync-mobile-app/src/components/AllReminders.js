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
        <TouchableOpacity
          style={[styles.iconButton, {backgroundColor: '#6366F1'}]}
          accessibilityLabel="Add new task"
          accessibilityRole="button"
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.listContainerScrollView}>
        {reminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderItemCard}>
            <TouchableOpacity
              onPress={() => toggleReminderCompleted(reminder.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: reminder.completed }}
              accessibilityLabel={reminder.completed ? `Mark task ${reminder.task} as incomplete` : `Mark task ${reminder.task} as complete`}
            >
              {reminder.completed ? <CheckCircle size={24} color="#10B981" /> : <Circle size={24} color="#9CA3AF" />}
            </TouchableOpacity>
            <View style={styles.reminderDetails}>
              <View style={styles.reminderMeta}>
                <Text style={styles.reminderTime}>{reminder.time}</Text>
                <Text style={[styles.badge, styles.categoryBadge]}>{reminder.category}</Text>
                 <Text style={[styles.badge, 
                    reminder.priority === 'high' ? styles.priorityHigh :
                    reminder.priority === 'medium' ? styles.priorityMedium :
                    styles.priorityLow
                  ]}>{reminder.priority}</Text>
                {reminder.aiOptimized && (
                  <View style={[styles.badge, styles.aiBadgeSmall]}>
                    <Sparkles size={12} color="#8B5CF6"/>
                    <Text style={styles.aiBadgeText}>IA</Text>
                  </View>
                )}
              </View>
              <Text style={reminder.completed ? styles.taskTextCompleted : styles.taskText}>{reminder.task}</Text>
              <View style={styles.reminderStreak}>
                <Star size={16} color="#F59E0B" />
                <Text style={styles.reminderStreakText}>Série de {reminder.streak} jours</Text>
              </View>
            </View>
            <View style={styles.reminderActions}>
              <TouchableOpacity
                accessibilityLabel={`Edit task ${reminder.task}`}
                accessibilityRole="button"
              >
                <Edit3 size={16} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel={`Delete task ${reminder.task}`}
                accessibilityRole="button"
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {reminders.length === 0 && <Text style={styles.emptyListText}>Aucun rappel pour le moment.</Text>}
      </ScrollView>
    </View>
  );
};

export default AllReminders;
