import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Switch,
} from 'react-native';
import { User, LogOut, Save, Image as ImageIcon, Edit3, Moon } from 'lucide-react-native';
import useStore from '../store';

const SettingsScreen = ({ styles: globalStyles }) => {
  const user = useStore(state => state.user);
  const detailedUserProfile = useStore(state => state.detailedUserProfile);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  const logout = useStore(state => state.logout);
  const isDarkMode = useStore(state => state.isDarkMode);
  const toggleDarkMode = useStore(state => state.toggleDarkMode);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (detailedUserProfile) {
      setName(detailedUserProfile.name || (user && user.displayName) || (user && user.email) || '');
      setBio(detailedUserProfile.bio || '');
      setAvatarUrl(detailedUserProfile.avatarUrl || '');
    } else if (user) {
      setName(user.displayName || user.email || '');
      setBio('');
      setAvatarUrl('');
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
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => logout() },
      ]
    );
  };

  const localStyles = getSettingsStyles(globalStyles);

  return (
    <ScrollView style={localStyles.container} contentContainerStyle={localStyles.contentContainer}>
      <View style={localStyles.header}>
        <User size={24} color={globalStyles.colors.textSecondary} />
        <Text style={localStyles.headerTitle}>Profile Settings</Text>
      </View>

      {/* Dark Mode Toggle */}
      <View style={localStyles.settingRow}>
        <View style={localStyles.settingRowLeft}>
          <Moon size={20} color={globalStyles.colors.textSecondary} />
          <Text style={localStyles.settingLabel}>Dark Mode</Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: globalStyles.colors.border, true: globalStyles.colors.primaryLight }}
          thumbColor={isDarkMode ? globalStyles.colors.primary : globalStyles.colors.slate200}
        />
      </View>

      {user && (
        <View style={localStyles.emailContainer}>
          <Text style={localStyles.label}>Email</Text>
          <Text style={localStyles.emailText}>{user.email}</Text>
        </View>
      )}

      <View style={localStyles.inputGroup}>
        <Text style={localStyles.label}>Name</Text>
        <View style={localStyles.inputContainer}>
          <Edit3 size={20} color={globalStyles.colors.textLight} style={localStyles.inputIcon} />
          <TextInput
            style={localStyles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            autoCapitalize="words"
            placeholderTextColor={globalStyles.colors.textLight}
          />
        </View>
      </View>

      <View style={localStyles.inputGroup}>
        <Text style={localStyles.label}>Bio</Text>
        <View style={localStyles.inputContainer}>
          <Edit3 size={20} color={globalStyles.colors.textLight} style={localStyles.inputIcon} />
          <TextInput
            style={[localStyles.input, localStyles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={3}
            placeholderTextColor={globalStyles.colors.textLight}
          />
        </View>
      </View>

      <View style={localStyles.inputGroup}>
        <Text style={localStyles.label}>Avatar URL</Text>
        <View style={localStyles.inputContainer}>
          <ImageIcon size={20} color={globalStyles.colors.textLight} style={localStyles.inputIcon} />
          <TextInput
            style={localStyles.input}
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="Enter image URL for your avatar"
            keyboardType="url"
            placeholderTextColor={globalStyles.colors.textLight}
          />
        </View>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={localStyles.avatarPreview} onError={(e) => console.log("Failed to load avatar preview", e.nativeEvent.error)} />
        ) : (
          <View style={localStyles.avatarPlaceholder}>
            <ImageIcon size={40} color={globalStyles.colors.textDisabled} />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[globalStyles.primaryButton, localStyles.button]}
        onPress={handleSaveProfile}
      >
        <Save size={20} color={globalStyles.colors.textOnPrimary} />
        <Text style={globalStyles.primaryButtonText}>Save Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles.primaryButton, localStyles.button, localStyles.logoutButton]}
        onPress={handleLogout}
      >
        <LogOut size={20} color={globalStyles.colors.textOnPrimary} />
        <Text style={globalStyles.primaryButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getSettingsStyles = (globalStyles) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.colors.background,
  },
  contentContainer: {
    padding: globalStyles.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: globalStyles.spacing.lg,
  },
  headerTitle: {
    fontSize: globalStyles.textSizes.xxl,
    fontWeight: globalStyles.fontWeights.bold,
    marginLeft: globalStyles.spacing.sm,
    color: globalStyles.colors.text,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: globalStyles.colors.surface,
    borderRadius: 12,
    padding: globalStyles.spacing.md,
    marginBottom: globalStyles.spacing.lg,
    borderWidth: 1,
    borderColor: globalStyles.colors.border,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: globalStyles.spacing.sm,
  },
  settingLabel: {
    fontSize: globalStyles.textSizes.md,
    fontWeight: globalStyles.fontWeights.medium,
    color: globalStyles.colors.text,
  },
  emailContainer: {
    marginBottom: globalStyles.spacing.lg,
    padding: globalStyles.spacing.md,
    backgroundColor: globalStyles.colors.surface,
    borderRadius: 8,
    shadowColor: globalStyles.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: globalStyles.textSizes.md,
    color: globalStyles.colors.textSecondary,
    marginBottom: globalStyles.spacing.xs,
    fontWeight: globalStyles.fontWeights.medium,
  },
  emailText: {
    fontSize: globalStyles.textSizes.md,
    color: globalStyles.colors.text,
  },
  inputGroup: {
    marginBottom: globalStyles.spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: globalStyles.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: globalStyles.colors.border,
    shadowColor: globalStyles.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  inputIcon: {
    marginHorizontal: globalStyles.spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: globalStyles.spacing.sm,
    fontSize: globalStyles.textSizes.md,
    color: globalStyles.colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: globalStyles.spacing.sm,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: globalStyles.spacing.sm,
    alignSelf: 'center',
    backgroundColor: globalStyles.colors.border,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: globalStyles.spacing.sm,
    alignSelf: 'center',
    backgroundColor: globalStyles.colors.slate100 || globalStyles.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: globalStyles.spacing.md,
    marginTop: globalStyles.spacing.lg,
  },
  logoutButton: {
    backgroundColor: globalStyles.colors.error,
    marginTop: globalStyles.spacing.md,
  },
});

export default SettingsScreen;
