import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'; // StyleSheet removed
import useStore from '../store'; // Adjusted path

const ProfileSelector = ({ styles }) => { // Removed props now coming from store
  const profileTemplates = useStore((state) => state.profileTemplates);
  const userProfile = useStore((state) => state.userProfile);
  const setUserProfile = useStore((state) => state.setUserProfile);
  const setCurrentView = useStore((state) => state.setCurrentView);

  return (
    <View style={styles.viewContainer}>
      <Text style={styles.viewTitle}>Choisir votre profil</Text>
      <Text style={styles.viewSubtitle}>Sélectionnez le profil qui correspond le mieux à votre mode de vie pour obtenir des routines personnalisées.</Text>
      <ScrollView style={styles.profileSelectorGrid}>
        {Object.entries(profileTemplates).map(([key, profile]) => {
          const ProfileIcon = profile.icon; // Icon component from profileTemplates
          return (
          <TouchableOpacity
            key={key}
            onPress={() => {
              setUserProfile(key); // This will also trigger initializeProfileData in the store
              setCurrentView('dashboard');
            }}
            style={[styles.profileCard, userProfile === key && styles.profileCardActive]}
          >
            <View style={styles.profileCardContent}>
              <View style={[styles.profileIconContainer, { backgroundColor: profile.color || '#CCCCCC' }]}>
                 { ProfileIcon && <ProfileIcon size={36} color={profile.iconColor || "#FFFFFF"} /> }
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileDescription}>
                  {key === 'student' && "Routine optimisée pour les études et la vie étudiante"}
                  {key === 'professional' && "Équilibre travail-vie personnelle pour les actifs"}
                  {key === 'parent' && "Organisation familiale et gestion du temps avec enfants"}
                  {key === 'fitness' && "Routine axée sur la santé et la forme physique"}
                </Text>
                <View style={styles.profileRoutinesPreview}>
                  {profile.routines.slice(0, 3).map((routine, idx) => (
                    <Text key={idx} style={[styles.badge, styles.categoryBadgeSmall]}>
                      {routine.category}
                    </Text>
                  ))}
                  {profile.routines.length > 3 && <Text style={styles.profileRoutinesMore}>+{profile.routines.length - 3} autres</Text>}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )})}
      </ScrollView>
    </View>
  );
};

export default ProfileSelector;
