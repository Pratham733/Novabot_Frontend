import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { updateProfile } from '@/lib/api';

interface SettingSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  type: 'toggle' | 'input' | 'button' | 'info';
  value?: any;
  placeholder?: string;
  onPress?: () => void;
  onChange?: (value: any) => void;
}

export default function SettingsPage() {
  const { user, logout, updateLocalUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    display_name: user?.display_name || '',
    bio: '',
    avatar: '',
  });
  // Password change state commented out (feature disabled for deployment)
  // const [passwordData, setPasswordData] = useState({
  //   current_password: '',
  //   new_password: '',
  //   confirm_password: '',
  // });
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    chat_reminders: false,
  });
  const [privacy, setPrivacy] = useState({
    profile_visibility: 'public',
    data_collection: true,
    analytics: false,
  });

  const handleProfileUpdate = useCallback(async () => {
    if (!profileData.display_name.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    setLoading(true);
    try {
  const updated = await updateProfile({
        display_name: profileData.display_name.trim(),
        bio: profileData.bio.trim(),
        avatar: profileData.avatar.trim(),
      });
  updateLocalUser({ display_name: updated.display_name || profileData.display_name });

  Alert.alert('Success', 'Profile updated');
    } catch (error: any) {
      const errorMsg = error?.message?.includes('not available') 
        ? 'Profile update feature is not available on the backend yet'
        : `Failed to update profile: ${error?.message || 'Unknown error'}`;
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [profileData]);

  const { token } = useAuth();
  const initializedRef = React.useRef(false);
  useEffect(() => {
    if (!user || !token || initializedRef.current) return;
    setProfileData(prev => ({
      ...prev,
      display_name: user.display_name || prev.display_name,
      bio: user.bio || '',
      avatar: user.avatar || ''
    }));
    initializedRef.current = true;
  }, [user?.id, token]);

  // Password change handler removed (feature disabled)
  // const handlePasswordChange = useCallback(async () => { /* disabled */ }, [passwordData]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Info', 'Account deletion feature will be implemented soon');
        }}
      ]
    );
  };

  const settingSections: SettingSection[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: 'person',
      color: '#3b82f6',
      items: [
        {
          id: 'display_name',
          label: 'Display Name',
          type: 'input',
          value: profileData.display_name,
          placeholder: 'Enter display name',
          onChange: (value) => setProfileData(prev => ({ ...prev, display_name: value })),
        },
        {
          id: 'bio',
          label: 'Bio',
          type: 'input',
          value: profileData.bio,
          placeholder: 'Short bio',
          onChange: (value) => setProfileData(prev => ({ ...prev, bio: value })),
        },
        {
          id: 'avatar',
          label: 'Avatar URL',
          type: 'input',
          value: profileData.avatar,
          placeholder: 'https://... (optional)',
          onChange: (value) => setProfileData(prev => ({ ...prev, avatar: value })),
        },
        {
          id: 'update_profile',
          label: 'Update Profile',
          type: 'button',
          onPress: handleProfileUpdate,
        },
      ]
    },
  // Security section removed (password change disabled)
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications',
      color: '#f59e0b',
      items: [
        {
          id: 'email_notifications',
          label: 'Email Notifications',
          type: 'toggle',
          value: notifications.email_notifications,
          onChange: (value) => setNotifications(prev => ({ ...prev, email_notifications: value })),
        },
        {
          id: 'push_notifications',
          label: 'Push Notifications',
          type: 'toggle',
          value: notifications.push_notifications,
          onChange: (value) => setNotifications(prev => ({ ...prev, push_notifications: value })),
        },
        {
          id: 'chat_reminders',
          label: 'Chat Reminders',
          type: 'toggle',
          value: notifications.chat_reminders,
          onChange: (value) => setNotifications(prev => ({ ...prev, chat_reminders: value })),
        },
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Data',
      icon: 'lock-closed',
      color: '#8b5cf6',
      items: [
        {
          id: 'profile_visibility',
          label: 'Profile Visibility',
          type: 'info',
          value: privacy.profile_visibility === 'public' ? 'Public' : 'Private',
        },
        {
          id: 'data_collection',
          label: 'Data Collection',
          type: 'toggle',
          value: privacy.data_collection,
          onChange: (value) => setPrivacy(prev => ({ ...prev, data_collection: value })),
        },
        {
          id: 'analytics',
          label: 'Analytics',
          type: 'toggle',
          value: privacy.analytics,
          onChange: (value) => setPrivacy(prev => ({ ...prev, analytics: value })),
        },
      ]
    },
    {
      id: 'account',
      title: 'Account',
      icon: 'settings',
      color: '#ef4444',
      items: [
        {
          id: 'logout',
          label: 'Logout',
          type: 'button',
          onPress: handleLogout,
        },
        {
          id: 'delete_account',
          label: 'Delete Account',
          type: 'button',
          onPress: handleDeleteAccount,
        },
      ]
    }
  ];

  const renderSettingItem = (item: SettingItem) => {
    switch (item.type) {
      case 'input':
        return (
          <View key={item.id} style={styles.settingItem}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <TextInput
              style={styles.settingInput}
              value={item.value}
              onChangeText={item.onChange}
              placeholder={item.placeholder}
              placeholderTextColor="#64748b"
              secureTextEntry={item.id.includes('password')}
            />
          </View>
        );
      
      case 'toggle':
        return (
          <View key={item.id} style={styles.settingItem}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Switch
              value={item.value}
              onValueChange={item.onChange}
              trackColor={{ false: '#374151', true: '#3b82f6' }}
              thumbColor={item.value ? '#ffffff' : '#9ca3af'}
            />
          </View>
        );
      
      case 'button':
        return (
          <Pressable
            key={item.id}
            style={[
              styles.settingButton,
              item.id === 'delete_account' && styles.dangerButton,
              item.id === 'logout' && styles.warningButton,
              loading && styles.disabledButton
            ]}
            onPress={item.onPress}
            disabled={loading}
          >
            <Text style={[
              styles.settingButtonText,
              item.id === 'delete_account' && styles.dangerButtonText,
              item.id === 'logout' && styles.warningButtonText
            ]}>
              {item.label}
            </Text>
          </Pressable>
        );
      
      case 'info':
        return (
          <View key={item.id} style={styles.settingItem}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Text style={styles.settingValue}>{item.value}</Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <Layout 
      title="Settings" 
      subtitle="Manage your account preferences and security"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#3b82f620' }]}> 
              <Ionicons name="refresh" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.sectionTitle}>Profile Data</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.settingDescription}>Profile info is cached for performance. You can force a server refresh if you recently updated data elsewhere.</Text>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && { backgroundColor: '#1d4ed8' }]}
              onPress={async () => {
                try {
                  const mod = await import('@/lib/api');
                  const fresh = await mod.getProfile(true);
                  updateLocalUser(fresh);
                  Alert.alert('Success', 'Profile refreshed');
                } catch (e: any) {
                  Alert.alert('Error', e?.message || 'Failed to refresh profile');
                }
              }}
            >
              <Text style={styles.primaryButtonText}>Force Refresh Profile</Text>
            </Pressable>
          </View>
        </View>
        {settingSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: `${section.color}20` }]}>
                <Ionicons name={section.icon as any} size={24} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  settingInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    minWidth: 200,
  },
  settingButton: {
  backgroundColor: '#3b82f6',
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 10,
  alignItems: 'center',
  marginHorizontal: 16,
  marginTop: 0,
  marginBottom: 16,
  alignSelf: 'flex-start',
  minWidth: 140,
  },
  settingButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  dangerButtonText: {
    color: '#ffffff',
  },
  warningButton: {
    backgroundColor: '#f59e0b',
  },
  warningButtonText: {
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: '#64748b',
    opacity: 0.6,
  },
  settingDescription: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

