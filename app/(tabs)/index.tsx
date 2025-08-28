import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { chat, listDocuments } from '@/lib/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentDocuments();
  }, []);

  const loadRecentDocuments = async () => {
    try {
      const docs = await listDocuments();
      const recent = Array.isArray(docs) ? docs.slice(0, 3) : docs.results?.slice(0, 3) || [];
      setRecentDocuments(recent);
    } catch (error) {
      // Swallow fetch error silently in production; optionally add monitoring here
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Generate Document',
      description: 'Create professional documents with AI',
      icon: 'create',
      color: '#667eea',
      route: '/generator',
    },
  // Documents temporarily disabled
  // {
  //   title: 'View Documents',
  //   description: 'Access your saved documents',
  //   icon: 'document-text',
  //   color: '#10b981',
  //   route: '/doc',
  // },
    {
      title: 'Chat with AI',
      description: 'Get help and answers instantly',
      icon: 'chatbubbles',
      color: '#f59e0b',
      route: '/chat',
    },
  // History temporarily disabled
  // {
  //   title: 'Document History',
  //   description: 'Review your document timeline',
  //   icon: 'time',
  //   color: '#8b5cf6',
  //   route: '/history',
  // },
  ];

  const stats = [
    { label: 'Documents Created', value: recentDocuments.length, icon: 'document-text', color: '#667eea' },
    { label: 'AI Conversations', value: '24/7', icon: 'chatbubbles', color: '#10b981' },
    { label: 'Export Formats', value: '4+', icon: 'download', color: '#f59e0b' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Welcome to NovaBot</Text>
          <Text style={styles.heroSubtitle}>
            Your AI-powered document generation and management assistant
          </Text>
        </View>
        <View style={styles.heroDecoration} />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <Pressable
              key={index}
              style={[styles.actionCard, { borderLeftColor: action.color }]}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon as any} size={24} color="#ffffff" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Activity</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                <Ionicons name={stat.icon as any} size={20} color="#ffffff" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Documents */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Documents</Text>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading recent documents...</Text>
          </View>
        ) : recentDocuments.length > 0 ? (
          <View style={styles.documentsList}>
            {recentDocuments.map((doc, index) => (
              <View key={index} style={styles.documentCard}>
                <View style={styles.documentIcon}>
                  <Ionicons name="document-text" size={24} color="#667eea" />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>{doc.title || 'Untitled Document'}</Text>
                  <Text style={styles.documentType}>{doc.doc_type?.replace('_', ' ') || 'Document'}</Text>
                  <Text style={styles.documentDate}>
                    {new Date(doc.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Pressable style={styles.documentAction}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#9ca3af" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No documents yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first document to get started
            </Text>
            <Pressable
              style={styles.createFirstButton}
              onPress={() => router.push('/generator' as any)}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.createFirstButtonText}>Create Document</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Tips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pro Tips</Text>
        <View style={styles.tipsContainer}>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color="#f59e0b" />
            <Text style={styles.tipText}>
              Use specific prompts for better AI-generated content
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="download" size={24} color="#10b981" />
            <Text style={styles.tipText}>
              Export documents in multiple formats for different use cases
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="save" size={24} color="#667eea" />
            <Text style={styles.tipText}>
              Save your work frequently to maintain a complete history
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  heroSection: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  heroDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  quickActionsGrid: {
    gap: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  documentType: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  documentDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  documentAction: {
    padding: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  createFirstButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginLeft: 12,
  },
});
