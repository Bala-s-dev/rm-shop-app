import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { CustomButton } from '@/components/CustomButton';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [bookid, setBookid] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!bookid.trim()) {
      Alert.alert('Error', 'Please enter your Book ID');
      return;
    }

    setLoading(true);
    try {
      const success = await signIn(bookid.trim());
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Invalid Book ID or inactive account');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>RM Jewellers</Text>
        <Text style={styles.subtitle}>Enter your Book ID to continue</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Book ID"
            placeholderTextColor="#888"
            value={bookid}
            onChangeText={setBookid}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <CustomButton
          title="Login"
          onPress={handleLogin}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    color: '#FFD700',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#2d2d2d',
    color: '#ffffff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
});