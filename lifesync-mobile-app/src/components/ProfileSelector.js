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
      <Text style={[styles.viewTitle, {color: styles.colors.text}]}>Choisir votre profil</Text>
      <Text style={[styles.viewSubtitle, {color: styles.colors.textSecondary}]}>Sélectionnez le profil qui correspond le mieux à votre mode de vie pour obtenir des routines personnalisées.</Text>
      <ScrollView style={styles.profileSelectorGrid}>
        {Object.entries(profileTemplates).map(([key, profile]) => {
          const ProfileIcon = profile.icon; // Icon component from profileTemplates
          // Determine icon color: use profile.iconColor if provided, otherwise default to textOnPrimary if background is a theme color, or fallback.
          const iconContainerBg = profile.color || styles.colors.textLight; // Fallback to a neutral theme color
          let iconColorToUse = profile.iconColor || styles.colors.textOnPrimary; // Default for themed backgrounds
          // If profile.color is not a theme color that implies textOnPrimary, adjust iconColor if needed.
          // This logic might need more sophisticated mapping if profile.color can be arbitrary.
          // For now, assuming profile.color, if set, is a color that works with textOnPrimary.
          if (!profile.iconColor && iconContainerBg === styles.colors.textLight) {
            iconColorToUse = styles.colors.text; // Example: if bg is light gray, use dark text for icon
          }


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
              <View style={[styles.profileIconContainer, { backgroundColor: iconContainerBg }]}>
                 { ProfileIcon && <ProfileIcon size={36} color={iconColorToUse} /> }
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
                    // Using categoryBadge (which implies primaryBg and primary color)
                    // Consider if these badges should have unique colors per category or profile type
                    <Text key={idx} style={[styles.badge, styles.categoryBadgeSmall]}>
                      {routine.category}
                    </Text>
                  ))}
                  {profile.routines.length > 3 && <Text style={[styles.profileRoutinesMore, {color: styles.colors.textLight}]}>+{profile.routines.length - 3} autres</Text>}
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
