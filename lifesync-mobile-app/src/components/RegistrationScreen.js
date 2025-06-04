import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import useStore from '../store';

const RegistrationScreen = ({ navigation }) => {
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
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={handleGoToLogin}>
        <Text style={[styles.buttonText, styles.buttonOutlineText]}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f0f4f8' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 24, textAlign: 'center' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4F46E5', // Indigo
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  buttonOutlineText: {
    color: '#4F46E5',
  }
});

export default RegistrationScreen;
