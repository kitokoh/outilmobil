import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { User, LogOut, Save, Image as ImageIcon, Edit3 } from 'lucide-react-native';
import useStore from '../store';

const SettingsScreen = ({ styles: globalStyles }) => { // Accept globalStyles
  const user = useStore(state => state.user);
  const detailedUserProfile = useStore(state => state.detailedUserProfile);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  const logout = useStore(state => state.logout);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (detailedUserProfile) {
      setName(detailedUserProfile.name || (user && user.displayName) || (user && user.email) || '');
      setBio(detailedUserProfile.bio || '');
      setAvatarUrl(detailedUserProfile.avatarUrl || '');
    } else if (user) {
      // Fallback if detailedUserProfile is not yet loaded or doesn't exist
      setName(user.displayName || user.email || '');
      setBio(''); // No bio in basic user object
      setAvatarUrl(''); // No avatarUrl in basic user object
    }
  }, [detailedUserProfile, user]);

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({ name, bio, avatarUrl });
      Alert.alert('Profile Updated', 'Your profile has been successfully updated.');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Update Failed', error.message || 'Could not update profile. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => logout()
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <User size={24} color={globalStyles.colors.textSecondary} />
        <Text style={styles.headerTitle}>Profile Settings</Text>
      </View>

      {user && (
        <View style={styles.emailContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.emailText}>{user.email}</Text>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <View style={styles.inputContainer}>
          <Edit3 size={20} color={globalStyles.colors.textLight} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            autoCapitalize="words"
            placeholderTextColor={globalStyles.colors.textLight}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bio</Text>
        <View style={styles.inputContainer}>
          <Edit3 size={20} color={globalStyles.colors.textLight} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={3}
            placeholderTextColor={globalStyles.colors.textLight}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Avatar URL</Text>
        <View style={styles.inputContainer}>
          <ImageIcon size={20} color={globalStyles.colors.textLight} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="Enter image URL for your avatar"
            keyboardType="url"
            placeholderTextColor={globalStyles.colors.textLight}
          />
        </View>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarPreview} onError={(e) => console.log("Failed to load avatar preview", e.nativeEvent.error)} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <ImageIcon size={40} color={globalStyles.colors.textDisabled} />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[globalStyles.primaryButton, styles.button]}
        onPress={handleSaveProfile}
      >
        <Save size={20} color={globalStyles.colors.textOnPrimary}
          // style={globalStyles.primaryButton.iconStyle} // Assuming primaryButton has iconStyle for margin if needed
        />
        <Text style={globalStyles.primaryButtonText}>Save Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles.primaryButton, styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <LogOut size={20} color={globalStyles.colors.textOnPrimary}
          // style={globalStyles.primaryButton.iconStyle}
        />
        <Text style={globalStyles.primaryButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.colors.background,
  },
  contentContainer: {
    padding: globalStyles.spacing.lg, // 20 -> lg (24) or md (16) can be chosen
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: globalStyles.spacing.lg, // 25 -> lg (24)
  },
  headerTitle: {
    fontSize: globalStyles.textSizes.xxl, // 22 -> xxl (24)
    fontWeight: globalStyles.fontWeights.bold,
    marginLeft: globalStyles.spacing.sm, // 10 -> sm (12)
    color: globalStyles.colors.text, // #333 -> text
  },
  emailContainer: {
    marginBottom: globalStyles.spacing.lg, // 20 -> lg
    padding: globalStyles.spacing.md, // 15 -> md (16)
    backgroundColor: globalStyles.colors.surface, // #FFFFFF -> surface
    borderRadius: 8, // Consider globalStyles.spacing value for radius
    // Use global card shadow or remove if not standard
    shadowColor: globalStyles.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: globalStyles.textSizes.md, // 16 -> md
    color: globalStyles.colors.textSecondary, // #4A4A4A -> textSecondary
    marginBottom: globalStyles.spacing.xs, // 8 -> xs
    fontWeight: globalStyles.fontWeights.medium, // 500 -> medium
  },
  emailText: {
    fontSize: globalStyles.textSizes.md, // 16 -> md
    color: globalStyles.colors.text, // #666 -> text or textSecondary
  },
  inputGroup: {
    marginBottom: globalStyles.spacing.lg, // 20 -> lg
  },
  inputContainer: { // Similar to a card style
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: globalStyles.colors.surface, // #FFFFFF -> surface
    borderRadius: 8,
    borderWidth: 1,
    borderColor: globalStyles.colors.border, // #E0E0E0 -> border
    // Optional: use global shadow style for inputs if defined
    shadowColor: globalStyles.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  inputIcon: {
    marginHorizontal: globalStyles.spacing.sm, // 10 -> sm (12)
    // Color will be set directly in JSX for icons
  },
  input: {
    flex: 1,
    height: 50, // Keep or make dynamic with padding
    paddingHorizontal: globalStyles.spacing.sm, // 10 -> sm (12)
    fontSize: globalStyles.textSizes.md, // 16 -> md
    color: globalStyles.colors.text, // #333 -> text
  },
  textArea: {
    height: 80, // Keep or adjust based on content
    textAlignVertical: 'top',
    paddingTop: globalStyles.spacing.sm, // 10 -> sm (12)
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50, // Standard large radius
    marginTop: globalStyles.spacing.sm, // 10 -> sm
    alignSelf: 'center',
    backgroundColor: globalStyles.colors.border, // #E0E0E0 -> border
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: globalStyles.spacing.sm, // 10 -> sm
    alignSelf: 'center',
    backgroundColor: globalStyles.colors.slate100 || globalStyles.colors.background, // #E9E9E9
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Save button should use globalStyles.primaryButton
  button: {
    // Merging with globalStyles.primaryButton which has:
    // backgroundColor: globalStyles.colors.primary,
    // paddingVertical: globalStyles.spacing.sm (12) vs 15 here. Overriding paddingVertical for larger touch target.
    paddingVertical: globalStyles.spacing.md, // Explicitly set larger padding
    // borderRadius: 10 vs 8 here. globalStyles.primaryButton.borderRadius is 10.
    // flexDirection, alignItems, justifyContent, gap, shadow... are inherited.
    // This local style can add marginTop or override specific things if needed.
    marginTop: globalStyles.spacing.lg, // Adjusted from 15 to lg (24) for more space
  },
  // Save button text should use globalStyles.primaryButtonText
  buttonText: { // This style is now effectively overridden by globalStyles.primaryButtonText
    // color: globalStyles.colors.textOnPrimary,
    // fontSize: globalStyles.textSizes.md (16) vs 18 here. Global is md.
    // fontWeight: globalStyles.fontWeights.semibold (600)
    // marginLeft: globalStyles.spacing.xs (8) vs 10 here. Global has gap.
  },
  buttonIcon: { // This style is not strictly needed if primaryButton's gap is sufficient
     // globalStyles.primaryButton already handles gap, so specific margin might not be needed
     // color is set directly on icon component
  },
  // Logout button should use globalStyles.error for background or a new semantic name if added
  logoutButton: {
    backgroundColor: globalStyles.colors.error, // #D9534F -> error
    marginTop: globalStyles.spacing.md, // Adjusted from 10 to md (16)
  },
});
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF', // A common blue color
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  buttonIcon: {
    // marginRight: 8, // If icon should be to the left of text
  },
  logoutButton: {
    backgroundColor: '#D9534F', // A common red/danger color
    marginTop: 10,
  },
});

export default SettingsScreen;
