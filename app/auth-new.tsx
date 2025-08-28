import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { AuthContext } from '@/context/AuthContext';
import { useContext } from 'react';
import { auth as fbAuth, GoogleAuthProvider, signInWithPopup } from '@/lib/firebase';
import { register as apiRegister } from '@/lib/api';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
  const { login, loginWithFirebase } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isRegister, setIsRegister] = useState(false);

  const toMessage = (e: any): string => {
    const data = e?.response?.data;
    if (!data) return e?.message || 'Request failed';
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) return data.join(', ');
    // DRF ValidationError shape: { field: [messages], non_field_errors: [...] }
    const parts: string[] = [];
    Object.entries(data).forEach(([k, v]) => {
      const msgs = Array.isArray(v) ? v : [String(v)];
      parts.push(`${k}: ${msgs.join(', ')}`);
    });
    return parts.join('\n');
  };

  const onLogin = async () => {
    setLoading(true); setError(undefined); setSuccess(undefined);
    try {
  await login(username, password);
  // Navigate to main home after successful login
  router.replace('/');
    } catch (e: any) {
      setError(toMessage(e) || 'Login failed');
    } finally { setLoading(false); }
  };

  const onGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(fbAuth, provider);
        const idToken = await cred.user.getIdToken();
        await loginWithFirebase(idToken);
  router.replace('/');
      } else {
        setError('Google sign-in for native to be wired with expo-auth-session');
      }
    } catch (e: any) {
      setError(e?.message || 'Google sign-in failed');
    }
  };

  const onRegister = async () => {
    if (!username || !password || !confirm) {
      setError('Please fill all required fields');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true); setError(undefined); setSuccess(undefined);
    try {
      await apiRegister({ username, password, password2: confirm, email: email || undefined });
      // Switch to login view after successful registration
      setIsRegister(false);
      setSuccess('Account created! Please sign in.');
      // Optionally clear password confirmation
      setConfirm('');
    } catch (e: any) {
      setError(toMessage(e) || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: '#6366F1' 
      }}>
        <ScrollView 
          contentContainerStyle={{ 
            flexGrow: 1, 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 24 
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <View style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: 20, 
              padding: 16, 
              marginBottom: 16 
            }}>
              <Ionicons name="chatbubbles" size={48} color="white" />
            </View>
            <Text style={{ 
              fontSize: 36, 
              fontWeight: 'bold', 
              color: 'white', 
              marginBottom: 8,
              textAlign: 'center'
            }}>
              NovaBot
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: 'rgba(255,255,255,0.8)', 
              textAlign: 'center' 
            }}>
              Your AI-powered assistant
            </Text>
          </View>

          {/* Form Card */}
          <View style={{ 
            width: '100%', 
            maxWidth: 400, 
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 24,
            padding: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 8,
          }}>
            {/* Status Messages */}
            {!!error && (
              <View style={{
                backgroundColor: '#FEF2F2',
                borderColor: '#FECACA',
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}>
                <Text style={{ color: '#DC2626', fontSize: 14 }}>{error}</Text>
              </View>
            )}
            {!!success && (
              <View style={{
                backgroundColor: '#F0FDF4',
                borderColor: '#BBF7D0',
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}>
                <Text style={{ color: '#16A34A', fontSize: 14 }}>{success}</Text>
              </View>
            )}

            {/* Form Title */}
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: '#1F2937', 
              textAlign: 'center',
              marginBottom: 24 
            }}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </Text>

            {/* Username Field */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ 
                marginBottom: 6, 
                color: '#374151', 
                fontWeight: '600',
                fontSize: 14 
              }}>
                Username
              </Text>
              <TextInput
                style={{
                  borderWidth: 2,
                  borderColor: '#E5E7EB',
                  borderRadius: 16,
                  padding: 16,
                  backgroundColor: '#F9FAFB',
                  color: '#111827',
                  fontSize: 16,
                }}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>

            {/* Email Field (Register only) */}
            {isRegister && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ 
                  marginBottom: 6, 
                  color: '#374151', 
                  fontWeight: '600',
                  fontSize: 14 
                }}>
                  Email <Text style={{ color: '#9CA3AF' }}>(optional)</Text>
                </Text>
                <TextInput
                  style={{
                    borderWidth: 2,
                    borderColor: '#E5E7EB',
                    borderRadius: 16,
                    padding: 16,
                    backgroundColor: '#F9FAFB',
                    color: '#111827',
                    fontSize: 16,
                  }}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            )}

            {/* Password Field */}
            <View style={{ marginBottom: isRegister ? 16 : 24 }}>
              <Text style={{ 
                marginBottom: 6, 
                color: '#374151', 
                fontWeight: '600',
                fontSize: 14 
              }}>
                Password
              </Text>
              <TextInput
                style={{
                  borderWidth: 2,
                  borderColor: '#E5E7EB',
                  borderRadius: 16,
                  padding: 16,
                  backgroundColor: '#F9FAFB',
                  color: '#111827',
                  fontSize: 16,
                }}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
              />
            </View>

            {/* Confirm Password Field (Register only) */}
            {isRegister && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ 
                  marginBottom: 6, 
                  color: '#374151', 
                  fontWeight: '600',
                  fontSize: 14 
                }}>
                  Confirm Password
                </Text>
                <TextInput
                  style={{
                    borderWidth: 2,
                    borderColor: '#E5E7EB',
                    borderRadius: 16,
                    padding: 16,
                    backgroundColor: '#F9FAFB',
                    color: '#111827',
                    fontSize: 16,
                  }}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                />
              </View>
            )}

            {/* Primary Action Button */}
            <Pressable
              onPress={isRegister ? onRegister : onLogin}
              disabled={loading}
              style={({ pressed }) => ({
                borderRadius: 16,
                padding: 16,
                backgroundColor: loading ? '#9CA3AF' : '#6366F1',
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                shadowColor: '#6366F1',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              })}
            >
              <Text style={{ 
                color: 'white', 
                textAlign: 'center', 
                fontWeight: '700',
                fontSize: 16 
              }}>
                {loading 
                  ? (isRegister ? 'Creating Account...' : 'Signing In...') 
                  : (isRegister ? 'Create Account' : 'Sign In')
                }
              </Text>
            </Pressable>

            {/* Toggle Auth Mode */}
            <Pressable 
              onPress={() => {
                setIsRegister(!isRegister);
                setError(undefined);
                setSuccess(undefined);
              }} 
              style={{ marginTop: 16 }}
            >
              <Text style={{ 
                color: '#6366F1', 
                textAlign: 'center', 
                fontWeight: '600',
                fontSize: 14 
              }}>
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
              </Text>
            </Pressable>

            {/* Google Sign-In */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 24,
            }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
              <Text style={{ 
                marginHorizontal: 16, 
                color: '#6B7280', 
                fontSize: 14 
              }}>
                or
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
            </View>

            <Pressable 
              onPress={onGoogle}
              style={({ pressed }) => ({
                borderRadius: 16,
                padding: 16,
                backgroundColor: '#FFFFFF',
                borderWidth: 2,
                borderColor: '#E5E7EB',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Ionicons name="logo-google" size={20} color="#4285F4" />
              <Text style={{ 
                color: '#374151', 
                fontWeight: '600',
                fontSize: 16,
                marginLeft: 8 
              }}>
                Continue with Google
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <Text style={{ 
            fontSize: 12, 
            color: 'rgba(255,255,255,0.6)', 
            marginTop: 32,
            textAlign: 'center' 
          }}>
            {Platform.OS.toUpperCase()} • Secure Authentication
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
