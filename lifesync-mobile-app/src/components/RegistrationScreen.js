import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Animated } from 'react-native';
import useStore from '../store';

const RegistrationScreen = ({ navigation, styles: globalStyles }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { register } = useStore();
  const setCurrentView = useStore((state) => state.setCurrentView);

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

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    const success = await register(email, password, name);
    if (success) {
      Alert.alert('Success', 'Registration successful! You are now logged in.');
      if (navigation && typeof navigation.navigate === 'function') {
        // navigation.navigate('MainAppStack');
      }
    } else {
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  const handleGoToLogin = () => {
    if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
    } else if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Login');
    } else {
      setCurrentView('login');
    }
  };

  const regStyles = getRegistrationStyles(globalStyles);

  return (
    <View style={regStyles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%', alignItems: 'center' }}>
        <Text style={regStyles.title}>Register</Text>
        <TextInput
          style={regStyles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholderTextColor={globalStyles.colors ? globalStyles.colors.textLight : '#94A3B8'}
        />
        <TextInput
          style={regStyles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={globalStyles.colors ? globalStyles.colors.textLight : '#94A3B8'}
        />
        <TextInput
          style={regStyles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={globalStyles.colors ? globalStyles.colors.textLight : '#94A3B8'}
        />
        <TouchableOpacity style={[globalStyles.primaryButton, regStyles.button]} onPress={handleRegister}>
          <Text style={globalStyles.primaryButtonText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[globalStyles.primaryButton, regStyles.button, regStyles.buttonOutline]} onPress={handleGoToLogin}>
          <Text style={[globalStyles.primaryButtonText, regStyles.buttonOutlineText]}>Back to Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const getRegistrationStyles = (globalStyles) => {
  const colors = globalStyles.colors || {};
  const spacing = globalStyles.spacing || {};
  const textSizes = globalStyles.textSizes || {};
  const fontWeights = globalStyles.fontWeights || {};

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.lg || 24,
      backgroundColor: colors.background || '#F8FAFC',
    },
    title: {
      fontSize: textSizes.xxxl || 30,
      fontWeight: fontWeights.bold || '700',
      color: colors.text || '#0F172A',
      marginBottom: spacing.lg || 24,
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.surface || '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border || '#E2E8F0',
      padding: spacing.md || 16,
      marginBottom: spacing.md || 16,
      borderRadius: 12,
      fontSize: textSizes.md || 16,
      color: colors.text || '#0F172A',
      width: '100%',
    },
    button: {
      alignItems: 'center',
      marginBottom: spacing.sm || 12,
      width: '100%',
    },
    buttonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary || '#4F46E5',
    },
    buttonOutlineText: {
      color: colors.primary || '#4F46E5',
    },
  });
};

export default RegistrationScreen;
