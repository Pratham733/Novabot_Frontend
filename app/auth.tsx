import React, { useState, useContext, useMemo } from 'react';
import { View, Text, TextInput, Pressable, Platform, StyleSheet, Animated } from 'react-native';
import DarkVeil from '@/components/DarkVeil';
import { AuthContext } from '@/context/AuthContext';
import { auth as fbAuth, GoogleAuthProvider, signInWithPopup } from '@/lib/firebase';
import { register as apiRegister } from '@/lib/api';
import { router } from 'expo-router';

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
  const [scale] = useState(new Animated.Value(1));

  const toMessage = (e: any): string => {
    const data = e?.response?.data;
    if (!data) return e?.message || 'Request failed';
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) return data.join(', ');
    const parts: string[] = [];
    Object.entries(data).forEach(([k, v]) => {
      const msgs = Array.isArray(v) ? v : [String(v)];
      parts.push(`${k}: ${msgs.join(', ')}`);
    });
    return parts.join('\n');
  };

  const animateIn = () => {
    Animated.timing(scale, { toValue: 1.05, duration: 200, useNativeDriver: true });
  };
  const animateOut = () => {
    Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true });
  };

  const onLogin = async () => {
    setLoading(true); setError(undefined); setSuccess(undefined);
    try {
      await login(username, password);
      router.replace('/');
    } catch (e: any) {
      setError(toMessage(e) || 'Login failed');
    } finally { setLoading(false); }
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
      setIsRegister(false);
      setSuccess('Account created. Please sign in.');
      setConfirm('');
    } catch (e: any) {
      setError(toMessage(e) || 'Registration failed');
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
        setError('Google sign-in not wired for native yet');
      }
    } catch (e: any) {
      setError(e?.message || 'Google sign-in failed');
    }
  };

  const primaryAction = isRegister ? onRegister : onLogin;

  const disabledPrimary = useMemo(() => {
    if (loading) return true;
    if (isRegister) return !username || !password || !confirm;
    return !username || !password;
  }, [loading, isRegister, username, password, confirm]);

  return (
    <View style={styles.screen}>
      {Platform.OS === 'web' && (
        <View style={styles.prismWrapper}>
          <DarkVeil hueShift={8} noiseIntensity={0.08} scanlineIntensity={0.12} scanlineFrequency={2.0} warpAmount={0.08} speed={0.5} />
        </View>
      )}
      <Animated.View
        style={[styles.form, { transform: [{ scale }] }]}
        // @ts-ignore web hover handlers
        onMouseEnter={animateIn}
        // @ts-ignore
        onMouseLeave={animateOut}
      >
        <View style={styles.headingWrap}>
          <Text id="heading" style={styles.heading}>{isRegister ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.subheading}>{isRegister ? 'Join NovaBot to unlock AI features' : 'Sign in to continue your AI journey'}</Text>
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!!success && <Text style={styles.success}>{success}</Text>}

        {/* Username */}
        <View style={styles.field}>
          <TextInput
            style={[
              styles.inputField,
              Platform.OS === 'web' && ({ 
                outlineWidth: 0, 
                outlineStyle: 'none', 
                borderWidth: 0, 
                borderStyle: 'none',
                boxShadow: 'none' 
              } as any)
            ]}
            placeholder="Username"
            placeholderTextColor="#888"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            editable={!loading}
          />
        </View>
        {/* Email (Register) */}
        {isRegister && (
          <View style={styles.field}>
            <TextInput
              style={[
                styles.inputField,
                Platform.OS === 'web' && ({ 
                  outlineWidth: 0, 
                  outlineStyle: 'none', 
                  borderWidth: 0, 
                  borderStyle: 'none',
                  boxShadow: 'none' 
                } as any)
              ]}
              placeholder="Email (optional)"
              placeholderTextColor="#888"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>
        )}
        {/* Password */}
        <View style={styles.field}>
          <TextInput
            style={[
              styles.inputField,
              Platform.OS === 'web' && ({ 
                outlineWidth: 0, 
                outlineStyle: 'none', 
                borderWidth: 0, 
                borderStyle: 'none',
                boxShadow: 'none' 
              } as any)
            ]}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
        </View>
        {/* Confirm Password */}
        {isRegister && (
          <View style={styles.field}>
            <TextInput
              style={[
                styles.inputField,
                Platform.OS === 'web' && ({ 
                  outlineWidth: 0, 
                  outlineStyle: 'none', 
                  borderWidth: 0, 
                  borderStyle: 'none',
                  boxShadow: 'none' 
                } as any)
              ]}
              placeholder="Confirm Password"
              placeholderTextColor="#888"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              editable={!loading}
            />
          </View>
        )}

  <View style={styles.btnRow}>
          <Pressable
            onPress={primaryAction}
            disabled={disabledPrimary}
            style={({ pressed }) => [
              styles.buttonPrimary,
              disabledPrimary && { opacity: 0.5 },
              pressed && !disabledPrimary && { backgroundColor: '#111111' }
            ]}
          >
            <Text style={styles.buttonText}>{loading ? (isRegister ? 'Creating...' : 'Signing In...') : (isRegister ? 'Sign Up' : 'Login')}</Text>
          </Pressable>
          <Pressable
            onPress={() => { setIsRegister(r => !r); setError(undefined); setSuccess(undefined); }}
            style={({ pressed }) => [styles.buttonAlt, pressed && { backgroundColor: '#111111' }]}
          >
            <Text style={styles.buttonText}>{isRegister ? 'Have Account' : 'Sign Up'}</Text>
          </Pressable>
        </View>

        {/* <Pressable
          onPress={() => onGoogle()}
          style={({ pressed }) => [styles.buttonWide, pressed && { backgroundColor: '#111111' }]}
        >
          <Text style={styles.buttonText}>Continue with Google</Text>
        </Pressable>

        <Pressable
          onPress={() => setSuccess('Password reset flow coming soon')}
          style={({ pressed }) => [styles.buttonDanger, pressed && { backgroundColor: '#7f1d1d' }]}
        >
          <Text style={styles.buttonText}>Forgot Password</Text>
        </Pressable> */}

  <Text style={styles.footer}>{Platform.OS.toUpperCase()} • Secure Auth • NovaBot</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050507',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  prismWrapper: {
    position: 'absolute',
    inset: 0,
  },
  form: {
    width: '100%',
  maxWidth: 540,
  backgroundColor: 'rgba(20,20,25,0.82)',
  borderRadius: 32,
  paddingHorizontal: 44,
  paddingBottom: 32,
  paddingTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden'
  },
  heading: {
    textAlign: 'center',
  marginTop: 8,
  marginBottom: 8,
    color: '#ffffff',
  fontSize: 30,
  fontWeight: '700',
  letterSpacing: 0.5
  },
  headingWrap: {
    alignItems: 'center',
  marginBottom: 24,
  },
  subheading: {
    color: '#9ca3af',
  fontSize: 15,
    textAlign: 'center'
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  borderRadius: 28,
  paddingHorizontal: 20,
  paddingVertical: 16,
  backgroundColor: '#181818',
  marginBottom: 14,
    borderWidth: 1,
    borderColor: '#262626'
  },
  inputField: {
    flex: 1,
  color: '#e5e5e5',
  fontSize: 18,
  fontWeight: '500',
  // Remove default white background / border (especially on web) so only cursor & text show
  backgroundColor: 'transparent',
  borderWidth: 0,
  borderColor: 'transparent',
  paddingVertical: 0, // tighter vertical alignment inside custom field container
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  marginTop: 28,
  marginBottom: 20,
  },
  buttonPrimary: {
    backgroundColor: '#252525',
  paddingHorizontal: 26,
  paddingVertical: 14,
  borderRadius: 10,
  marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  buttonAlt: {
    backgroundColor: '#252525',
  paddingHorizontal: 26,
  paddingVertical: 14,
  borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  buttonWide: {
    backgroundColor: '#252525',
  paddingHorizontal: 26,
  paddingVertical: 16,
  borderRadius: 10,
  marginBottom: 16,
  },
  buttonDanger: {
    backgroundColor: '#252525',
  paddingHorizontal: 26,
  paddingVertical: 16,
  borderRadius: 10,
  marginBottom: 32
  },
  buttonText: {
  color: '#ffffff',
  fontWeight: '600',
  letterSpacing: 0.75,
  fontSize: 16
  },
  error: {
    color: '#f87171',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14
  },
  success: {
    color: '#34d399',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14
  },
  footer: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8
  }
});
