import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import useStore from '../store';

const LoginScreen = ({ styles: globalStyles }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useStore((state) => state.login);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    setError('');
    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password. Please try again.');
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    }
  };

  const loginStyles = getLoginStyles(globalStyles);

  return (
    <View style={loginStyles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%', alignItems: 'center' }}>
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
            placeholderTextColor={globalStyles.colors ? globalStyles.colors.textLight : '#94A3B8'}
          />
          <TextInput
            style={loginStyles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={globalStyles.colors ? globalStyles.colors.textLight : '#94A3B8'}
          />
        </View>

        <TouchableOpacity style={[globalStyles.primaryButton, loginStyles.loginButton]} onPress={handleLogin}>
          <Text style={globalStyles.primaryButtonText}>Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const getLoginStyles = (globalStyles) => {
  const colors = globalStyles.colors || {};
  const spacing = globalStyles.spacing || {};
  const textSizes = globalStyles.textSizes || {};

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg || 24,
      backgroundColor: colors.background || '#F8FAFC',
    },
    title: {
      marginBottom: spacing.xs || 8,
      color: colors.primary || '#4F46E5',
    },
    subtitle: {
      marginBottom: spacing.xl || 32,
      textAlign: 'center',
      color: colors.textSecondary || '#475569',
    },
    inputContainer: {
      width: '100%',
      marginBottom: spacing.lg || 24,
    },
    input: {
      backgroundColor: colors.surface || '#FFFFFF',
      borderColor: colors.border || '#E2E8F0',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: spacing.md || 16,
      paddingVertical: spacing.sm || 12,
      fontSize: textSizes.md || 16,
      marginBottom: spacing.md || 16,
      color: colors.text || '#0F172A',
    },
    loginButton: {
      width: '100%',
      marginTop: spacing.xs || 8,
    },
    errorText: {
      color: colors.error || '#DC2626',
      fontSize: textSizes.sm || 14,
      textAlign: 'center',
      marginBottom: spacing.md || 16,
    },
  });
};

export default LoginScreen;
