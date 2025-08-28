import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth() as any;

  const navigationItems = [
    { id: 'home', label: 'Home', icon: 'home', route: '/' },
    { id: 'chat', label: 'AI Chat', icon: 'chatbubbles', route: '/chat' },
    { id: 'generator', label: 'Document Generator', icon: 'document-text', route: '/generator' },
  // { id: 'converter', label: 'File Converter', icon: 'swap-horizontal', route: '/file-convertor' }, // temporarily disabled
    { id: 'settings', label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  const getActiveTab = () => {
    const item = navigationItems.find(item => item.route === pathname);
    return item ? item.id : 'home';
  };

  const handleNavigation = (item: any) => {
    if (item.route !== pathname) {
      router.push(item.route);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  return (
    <View style={styles.container}>
      {/* Left Sidebar Navigation */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <View style={styles.logoContainer}>
            <Ionicons name="rocket" size={32} color="#3b82f6" />
            <Text style={styles.logoText}>NovaBot</Text>
          </View>
        </View>

        <ScrollView style={styles.navigationContainer} showsVerticalScrollIndicator={false}>
          {navigationItems.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.navItem,
                getActiveTab() === item.id && styles.activeNavItem
              ]}
              onPress={() => handleNavigation(item)}
            >
              <Ionicons 
                name={item.icon as any} 
                size={24} 
                color={getActiveTab() === item.id ? '#ffffff' : '#94a3b8'} 
              />
              <Text style={[
                styles.navLabel,
                getActiveTab() === item.id && styles.activeNavLabel
              ]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* User Section */}
        <View style={styles.userSection}>
          {user ? (
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color="#ffffff" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.display_name || user.username || ''}</Text>
                <Text style={styles.userEmail}>{user.email || ''}</Text>
              </View>
            </View>
          ) : (
            <Pressable style={styles.loginButton} onPress={() => router.push('/auth')}>
              <Ionicons name="log-in" size={20} color="#ffffff" />
              <Text style={styles.loginButtonText}>Sign In</Text>
            </Pressable>
          )}
          
          {user && (
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={20} color="#ef4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        <LinearGradient
          colors={['#0f172a', '#1e293b', '#334155']}
          style={styles.gradientBackground}
        >
          {(title || subtitle) && (
            <View style={styles.pageHeader}>
              {title && <Text style={styles.pageTitle}>{title}</Text>}
              {subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
            </View>
          )}
          
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {React.Children.map(children, (child) => {
              // Prevent raw text nodes (e.g. '.' or accidental strings) directly under a <View>
              if (typeof child === 'string') {
                const trimmed = child.trim();
                if (!trimmed) return null; // ignore pure whitespace
                return <Text style={{ color: '#ffffff' }}>{trimmed}</Text>;
              }
              return child as any;
            })}
          </ScrollView>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0f172a',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#1e293b',
    borderRightWidth: 1,
    borderRightColor: '#334155',
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  navigationContainer: {
    flex: 1,
    paddingTop: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    gap: 16,
  },
  activeNavItem: {
    backgroundColor: '#3b82f6',
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  activeNavLabel: {
    color: '#ffffff',
  },
  userSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  userEmail: {
    fontSize: 14,
    color: '#94a3b8',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  pageHeader: {
    padding: 40,
    paddingTop: 60,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 18,
    color: '#cbd5e1',
    lineHeight: 26,
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 40,
  },
});
