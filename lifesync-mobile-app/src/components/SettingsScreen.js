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

const SettingsScreen = () => {
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
        <User size={24} color="#4A4A4A" />
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
          <Edit3 size={20} color="#4A4A4A" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bio</Text>
        <View style={styles.inputContainer}>
          <Edit3 size={20} color="#4A4A4A" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Avatar URL</Text>
        <View style={styles.inputContainer}>
          <ImageIcon size={20} color="#4A4A4A" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="Enter image URL for your avatar"
            keyboardType="url"
          />
        </View>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarPreview} onError={(e) => console.log("Failed to load avatar preview", e.nativeEvent.error)} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <ImageIcon size={40} color="#cccccc" />
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
        <Save size={20} color="white" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <LogOut size={20} color="white" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  emailContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 8,
    fontWeight: '500',
  },
  emailText: {
    fontSize: 16,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  inputIcon: {
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#E0E0E0',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#E9E9E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
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
