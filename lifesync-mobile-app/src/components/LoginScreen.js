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

// Local styles for LoginScreen, referencing globalStyles
const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: globalStyles.spacing.lg, // p-6 -> spacing.lg (24)
    backgroundColor: globalStyles.colors.background, // bg-slate-50
  },
  title: { // This uses globalStyles.viewTitle which has its own marginBottom if applied directly
    // If viewTitle is used directly on Text, this local style might only need to adjust color if different
    // For now, assuming direct application of globalStyles.viewTitle, and this is for overrides or additions
    marginBottom: globalStyles.spacing.xs, // mb-2 -> spacing.xs (8)
    color: globalStyles.colors.primary, // text-indigo-600
  },
  subtitle: { // Similarly, globalStyles.viewSubtitle could be used
    marginBottom: globalStyles.spacing.xl, // mb-8 -> spacing.xl (32)
    textAlign: 'center',
    color: globalStyles.colors.textSecondary, // text-slate-600
  },
  inputContainer: {
    width: '100%',
    marginBottom: globalStyles.spacing.lg, // mb-6 -> spacing.lg (24)
  },
  input: {
    backgroundColor: globalStyles.colors.surface, // bg-white
    borderColor: globalStyles.colors.border, // border-slate-200
    borderWidth: 1,
    borderRadius: 8, // Keep as is, or define in spacing e.g. spacing.sm / 2 for consistency if desired for radii
    paddingHorizontal: globalStyles.spacing.md, // px-4 -> spacing.md (16)
    paddingVertical: globalStyles.spacing.sm, // py-3 -> spacing.sm (12)
    fontSize: globalStyles.textSizes.md, // text-base -> textSizes.md (16)
    marginBottom: globalStyles.spacing.md, // mb-4 -> spacing.md (16)
    color: globalStyles.colors.text, // text-slate-900
  },
  loginButton: { // Merged with globalStyles.primaryButton, so this can be for specific overrides
    width: '100%',
    marginTop: globalStyles.spacing.xs, // mt-2 -> spacing.xs (8)
  },
  errorText: {
    color: globalStyles.colors.error, // colors.red600
    fontSize: globalStyles.textSizes.sm, // text-sm -> textSizes.sm (14)
    textAlign: 'center',
    marginBottom: globalStyles.spacing.md, // mb-4 -> spacing.md (16)
  },
});

export default LoginScreen;
