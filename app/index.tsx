import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function MainPage() {
  const router = useRouter();
  const { user, logout } = useAuth() as any;
  const [activeTab, setActiveTab] = useState('home');

  const navigationItems = [
    { id: 'home', label: 'Home', icon: 'home', route: '/' },
    { id: 'chat', label: 'AI Chat', icon: 'chatbubbles', route: '/chat' },
    { id: 'generator', label: 'Document Generator', icon: 'document-text', route: '/generator' },
  // { id: 'history', label: 'History', icon: 'time', route: '/history' },
    // { id: 'converter', label: 'File Converter', icon: 'swap-horizontal', route: '/file-convertor' },
    { id: 'settings', label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  const handleNavigation = (item: any) => {
    setActiveTab(item.id);
    if (item.route !== '/') {
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
                activeTab === item.id && styles.activeNavItem
              ]}
              onPress={() => handleNavigation(item)}
            >
              <Ionicons 
                name={item.icon as any} 
                size={24} 
                color={activeTab === item.id ? '#ffffff' : '#94a3b8'} 
              />
              <Text style={[
                styles.navLabel,
                activeTab === item.id && styles.activeNavLabel
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
          <View style={styles.contentHeader}>
            <Text style={styles.welcomeTitle}>Welcome to NovaBot</Text>
            <Text style={styles.welcomeSubtitle}>
              Your AI-powered document generation and management platform
            </Text>
          </View>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Hero Chat Section */}
            <View style={styles.heroSection}>
              <View style={styles.heroContent}>
                <View style={styles.heroIcon}>
                  <Ionicons name="sparkles" size={48} color="#3b82f6" />
                </View>
                <Text style={styles.heroTitle}>AI Chat Assistant</Text>
                <Text style={styles.heroDescription}>
                  Choose your chat mood and get personalized AI responses. Whether you need coding help, 
                  research assistance, or just casual conversation, NovaBot adapts to your needs.
                </Text>
                <Pressable 
                  style={styles.heroButton}
                  onPress={() => router.push('/chat')}
                >
                  <Ionicons name="chatbubbles" size={24} color="#ffffff" />
                  <Text style={styles.heroButtonText}>Start Chatting</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.featuresGrid}>
              <Pressable 
                style={styles.featureCard}
                onPress={() => router.push('/chat')}
              >
                <View style={styles.featureIcon}>
                  <Ionicons name="chatbubbles" size={32} color="#3b82f6" />
                </View>
                <Text style={styles.featureTitle}>AI Chat</Text>
                <Text style={styles.featureDescription}>
                  Intelligent conversations with mood-based responses
                </Text>
              </Pressable>

              <Pressable 
                style={styles.featureCard}
                onPress={() => router.push('/generator')}
              >
                <View style={styles.featureIcon}>
                  <Ionicons name="document-text" size={32} color="#10b981" />
                </View>
                <Text style={styles.featureTitle}>Document Generator</Text>
                <Text style={styles.featureDescription}>
                  Create professional documents with AI assistance
                </Text>
              </Pressable>


              <Pressable 
                style={styles.featureCard}
                onPress={() => router.push('/file-convertor')}
              >
                <View style={styles.featureIcon}>
                  <Ionicons name="swap-horizontal" size={32} color="#8b5cf6" />
                </View>
                <Text style={styles.featureTitle}>File Converter</Text>
                <Text style={styles.featureDescription}>
                  Convert files between different formats
                </Text>
              </Pressable>
            </View>

            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>Quick Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Chat Sessions</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Documents Created</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Files Converted</Text>
                </View>
              </View>
            </View>
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
  contentHeader: {
    padding: 40,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#cbd5e1',
    lineHeight: 26,
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 40,
  },
  heroSection: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    padding: 32,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  heroContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 600,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
  },
  heroButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 40,
  },
  featureCard: {
    width: (width - 400) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 200,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  statsSection: {
    marginBottom: 40,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
