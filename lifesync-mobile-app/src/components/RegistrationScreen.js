import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native'; // Removed Button
import useStore from '../store';

const RegistrationScreen = ({ navigation, styles: globalStyles }) => { // Added styles: globalStyles
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { register } = useStore();
  const setCurrentView = useStore((state) => state.setCurrentView); // For navigation fallback

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    const success = await register(email, password, name);
    if (success) {
      Alert.alert('Success', 'Registration successful! You are now logged in.');
      // In a real app with React Navigation, you would navigate to the main app stack
      // For this conceptual update, we might rely on the isAuthenticated state change in LifeSyncApp.js
      // If navigation prop is not fully functional, setCurrentView might be a fallback.
      if (navigation && typeof navigation.navigate === 'function') {
        // navigation.navigate('MainAppStack'); // Or similar
      } else {
        // Fallback if navigation prop isn't there (e.g. when shown directly by simple conditional logic)
        // setCurrentView('dashboard'); // This will trigger re-render in LifeSyncApp if it observes currentView
      }
    } else {
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  const handleGoToLogin = () => {
    if (navigation && typeof navigation.goBack === 'function') {
        navigation.goBack();
    } else if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate('Login'); // Assuming a 'Login' route exists
    } else {
        // Fallback for conceptual navigation
        setCurrentView('login'); // This is a conceptual navigation for the simple switcher
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        placeholderTextColor={globalStyles.colors.textLight}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={globalStyles.colors.textLight}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={globalStyles.colors.textLight}
      />
      <TouchableOpacity style={[globalStyles.primaryButton, styles.button]} onPress={handleRegister}>
        <Text style={globalStyles.primaryButtonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[globalStyles.primaryButton, styles.button, styles.buttonOutline]} onPress={handleGoToLogin}>
        <Text style={[globalStyles.primaryButtonText, styles.buttonOutlineText]}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Ensure these local styles are defined *after* globalStyles is available if they need to reference it.
  // It's better to pass globalStyles and use it directly in the StyleSheet.create call.
  // The structure here assumes RegistrationScreen receives globalStyles prop and uses it.
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: globalStyles.spacing.lg, // Adjusted from 20, use lg for 24
    backgroundColor: globalStyles.colors.background, // '#f0f4f8' is slate50
  },
  title: { // This could potentially use globalStyles.h2 or h3
    fontSize: globalStyles.textSizes.xxxl, // Adjusted from 28, use xxxl for 30
    fontWeight: globalStyles.fontWeights.bold,
    color: globalStyles.colors.text, // '#333' is close to slate700/800, using general text
    marginBottom: globalStyles.spacing.lg, // Adjusted from 24
    textAlign: 'center',
  },
  input: {
    backgroundColor: globalStyles.colors.surface,
    borderWidth: 1,
    borderColor: globalStyles.colors.border,
    padding: globalStyles.spacing.md, // Adjusted from 15
    marginBottom: globalStyles.spacing.md, // Adjusted from 16
    borderRadius: 8, // Consider globalStyles.spacing.xs or similar if applicable for radii
    fontSize: globalStyles.textSizes.md, // Adjusted from 16
    color: globalStyles.colors.text,
  },
  // For button, leverage globalStyles.primaryButton and .primaryButtonText
  // This local style will be merged and can override or add specifics
  button: {
    // backgroundColor: globalStyles.colors.primary, // From globalStyles.primaryButton
    // padding: globalStyles.spacing.md, // From globalStyles.primaryButton (approx 15)
    // borderRadius: 8, // From globalStyles.primaryButton (approx 10)
    alignItems: 'center', // From globalStyles.primaryButton
    marginBottom: globalStyles.spacing.sm, // Adjusted from 10
    width: '100%', // Ensure buttons take full width like LoginScreen
  },
  buttonText: {
    // color: globalStyles.colors.textOnPrimary, // From globalStyles.primaryButtonText
    // fontWeight: globalStyles.fontWeights.semibold, // From globalStyles.primaryButtonText
    // fontSize: globalStyles.textSizes.md, // From globalStyles.primaryButtonText (approx 16)
  },
  // For buttonOutline, create a style that mirrors secondaryButton or a new global style if needed
  buttonOutline: {
    backgroundColor: 'transparent', // Or globalStyles.colors.surface
    borderWidth: 1,
    borderColor: globalStyles.colors.primary, // Use primary color for outline
  },
  buttonOutlineText: {
    color: globalStyles.colors.primary, // Text color matches border
    // fontWeight: globalStyles.fontWeights.semibold, // Consistent weight
    // fontSize: globalStyles.textSizes.md, // Consistent size
  }
});

export default RegistrationScreen;
