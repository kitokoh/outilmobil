import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import useStore from '../store'; // Assuming store is in ../store.js

const LoginScreen = ({ styles: globalStyles }) => { // Accept globalStyles as a prop
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useStore((state) => state.login);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError(''); // Clear previous errors
    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password. Please try again.');
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    }
    // On success, LifeSyncApp will automatically re-render due to isAuthenticated changing
  };

  return (
    <View style={loginStyles.container}>
      <Text style={[globalStyles.viewTitle, loginStyles.title]}>LifeSync</Text>
      <Text style={[globalStyles.viewSubtitle, loginStyles.subtitle]}>Welcome back! Please login to continue.</Text>
      
      {error ? <Text style={loginStyles.errorText}>{error}</Text> : null}
      
      <View style={loginStyles.inputContainer}>
        <TextInput
          style={loginStyles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={globalStyles.textSlate400.color}
        />
        <TextInput
          style={loginStyles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={globalStyles.textSlate400.color}
        />
      </View>
      
      <TouchableOpacity style={[globalStyles.primaryButton, loginStyles.loginButton]} onPress={handleLogin}>
        <Text style={globalStyles.primaryButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Local styles for LoginScreen, can use colors/fonts from globalStyles if needed for consistency
const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24, // p-6
    backgroundColor: '#F8FAFC', // bg-slate-50 from globalStyles.safeArea.backgroundColor
  },
  title: {
    marginBottom: 8, // mb-2
    color: '#4F46E5', // text-indigo-600 from globalStyles.headerTitle.color
  },
  subtitle: {
    marginBottom: 32, // mb-8
    textAlign: 'center',
    color: '#475569', // text-slate-600 from globalStyles.textSlate600.color
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24, // mb-6
  },
  input: {
    backgroundColor: '#FFFFFF', // bg-white
    borderColor: '#E2E8F0', // border-slate-200
    borderWidth: 1,
    borderRadius: 8, // rounded-lg
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3
    fontSize: 16, // text-base
    marginBottom: 16, // mb-4
    color: '#0F172A', // text-slate-900
  },
  loginButton: {
    width: '100%',
    marginTop: 8, // mt-2
  },
  errorText: {
    color: '#DC2626', // colors.red600
    fontSize: 14, // text-sm
    textAlign: 'center',
    marginBottom: 16, // mb-4
  },
});

export default LoginScreen;
