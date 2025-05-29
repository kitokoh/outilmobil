import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'; // StyleSheet removed
import { Plus, MapPin, Phone, Video, Edit3 } from 'lucide-react-native';
import useStore from '../store'; // Adjusted path

const AppointmentsView = ({ styles }) => { // Removed props now coming from store
  const appointments = useStore((state) => state.appointments);
  const friends = useStore((state) => state.friends);
  // Consider adding an action to the store for creating a new appointment
  // const createNewAppointment = useStore((state) => state.createNewAppointment); 

  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Mes Rendez-vous</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => { /* Call createNewAppointment action here */ }}>
          <Plus size={16} color="white" />
          <Text style={styles.primaryButtonText}>Nouveau RDV</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Prise de RDV avec contacts</Text>
        <View style={styles.gridTwoCols}>
          {friends.slice(0, 4).map((friend) => (
            <TouchableOpacity key={friend.id} style={styles.contactCard}>
              <Text style={styles.contactAvatar}>{friend.avatar}</Text>
              <View>
                <Text style={styles.contactName}>{friend.name}</Text>
                <Text style={styles.contactActionText}>Planifier RDV</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.listContainerScrollView}>
        {appointments.map((appointment) => (
          <View key={appointment.id} style={styles.listItemCard}>
            <View style={styles.listItemHeader}>
              <View>
                <Text style={styles.listItemTitle}>{appointment.title}</Text>
                <Text style={styles.listItemSubtitle}>avec {appointment.with}</Text>
              </View>
              <View style={styles.listItemTiming}>
                <Text style={styles.listItemDate}>{appointment.date}</Text>
                <Text style={styles.listItemTime}>{appointment.time}</Text>
              </View>
            </View>
            <View style={styles.listItemFooter}>
              <View style={styles.listItemMeta}>
                <MapPin size={16} color="#9CA3AF" />
                <Text style={styles.listItemLocation}>{appointment.location}</Text>
                <Text style={[styles.badge, appointment.confirmed ? styles.badgeSuccess : styles.badgeWarning]}>
                  {appointment.confirmed ? 'Confirmé' : 'En attente'}
                </Text>
              </View>
              <View style={styles.listItemActions}>
                <TouchableOpacity><Phone size={16} color="#9CA3AF" /></TouchableOpacity>
                <TouchableOpacity><Video size={16} color="#9CA3AF" /></TouchableOpacity>
                <TouchableOpacity><Edit3 size={16} color="#9CA3AF" /></TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        {appointments.length === 0 && <Text style={styles.emptyListText}>Aucun rendez-vous programmé.</Text>}
      </ScrollView>
    </View>
  );
};

export default AppointmentsView;
