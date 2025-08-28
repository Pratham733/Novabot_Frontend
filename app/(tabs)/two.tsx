import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Switch, Dimensions, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const { user, logout } = useContext(AuthContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person',
          title: 'Profile',
          subtitle: 'Manage your account information',
          action: 'navigate',
          route: '/profile',
        },
        {
          icon: 'shield-checkmark',
          title: 'Security',
          subtitle: 'Password and authentication settings',
          action: 'navigate',
          route: '/security',
        },
        {
          icon: 'notifications',
          title: 'Notifications',
          subtitle: 'Control your notification preferences',
          action: 'toggle',
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'moon',
          title: 'Dark Mode',
          subtitle: 'Switch between light and dark themes',
          action: 'toggle',
          value: darkModeEnabled,
          onValueChange: setDarkModeEnabled,
        },
        {
          icon: 'save',
          title: 'Auto Save',
          subtitle: 'Automatically save your work',
          action: 'toggle',
          value: autoSaveEnabled,
          onValueChange: setAutoSaveEnabled,
        },
        {
          icon: 'language',
          title: 'Language',
          subtitle: 'English (US)',
          action: 'navigate',
          route: '/language',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle',
          title: 'Help Center',
          subtitle: 'Get help and find answers',
          action: 'navigate',
          route: '/help',
        },
        {
          icon: 'document-text',
          title: 'Documentation',
          subtitle: 'Read our user guides',
          action: 'navigate',
          route: '/docs',
        },
        {
          icon: 'chatbubbles',
          title: 'Contact Support',
          subtitle: 'Get in touch with our team',
          action: 'navigate',
          route: '/contact',
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle',
          title: 'App Version',
          subtitle: '1.0.0',
          action: 'none',
        },
        {
          icon: 'heart',
          title: 'Rate App',
          subtitle: 'Share your feedback',
          action: 'navigate',
          route: '/rate',
        },
        {
          icon: 'share-social',
          title: 'Share App',
          subtitle: 'Tell friends about NovaBot',
          action: 'navigate',
          route: '/share',
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Customize your NovaBot experience
          </Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#667eea" />
          </View>
          <Text style={styles.userName}>{user?.username || 'User'}</Text>
        </View>
      </View>

      {/* Settings Sections */}
      <View style={styles.settingsContainer}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  style={styles.settingItem}
                  onPress={() => {
                    if (item.action === 'navigate' && item.route) {
                      router.push(item.route as any);
                    }
                  }}
                >
                  <View style={styles.settingIcon}>
                    <Ionicons name={item.icon as any} size={20} color="#667eea" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                  <View style={styles.settingAction}>
                    {item.action === 'toggle' && (
                      <Switch
                        value={item.value}
                        onValueChange={item.onValueChange}
                        trackColor={{ false: '#e5e7eb', true: '#667eea' }}
                        thumbColor="#ffffff"
                        ios_backgroundColor="#e5e7eb"
                      />
                    )}
                    {item.action === 'navigate' && (
                      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    )}
                    {item.action === 'none' && (
                      <View style={styles.noAction} />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Section */}
        <View style={styles.signOutSection}>
          <Pressable style={styles.signOutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </Pressable>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          NovaBot v1.0.0 • Made with ❤️
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  settingsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  settingAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAction: {
    width: 20,
    height: 20,
  },
  signOutSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fee2e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  signOutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
    textAlign: 'center',
  },
});
