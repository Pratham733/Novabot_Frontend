import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, Pressable, RefreshControl, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { AuthContext } from '@/context/AuthContext';
import { listDocuments } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Link, router } from 'expo-router';

export default function HistoryTab() {
  const { user, token } = useContext(AuthContext);
  const colorScheme = useColorScheme();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');

  const loadDocuments = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await listDocuments();
      const docs = Array.isArray(data) ? data : data?.results || [];
      setDocuments(docs);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load documents');
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadDocuments();
    }
  }, [user, token]);

  const onRefresh = () => {
    loadDocuments(true);
  };

  const getDocumentIcon = (docType: string) => {
    const iconMap: { [key: string]: any } = {
      report: 'document-text',
      email: 'mail',
      proposal: 'bulb',
      summary: 'list',
      article: 'newspaper',
      letter: 'chatbox',
    };
    return iconMap[docType] || 'document';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.emptyStateCard}>
          <Ionicons 
            name="time-outline" 
            size={64} 
            color={Colors[colorScheme ?? 'light'].muted} 
            style={{ marginBottom: 16 }}
          />
          <Text style={[styles.emptyStateTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Document History
          </Text>
          <Text style={[styles.emptyStateSubtitle, { color: Colors[colorScheme ?? 'light'].muted }]}>
            Sign in to view your created documents
          </Text>
          <Link href="/auth" asChild>
            <Pressable style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Ionicons name="hourglass" size={32} color={Colors[colorScheme ?? 'light'].muted} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].muted }]}>
          Loading your documents...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Document History
            </Text>
            <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].muted }]}>
              {documents.length} documents created
            </Text>
          </View>
           <Pressable 
             onPress={() => router.push('/generator')}
            style={[styles.createButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          >
            <Ionicons name="add" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={Colors[colorScheme ?? 'light'].error} />
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
            {error}
          </Text>
        </View>
      )}

      {documents.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors[colorScheme ?? 'light'].primary}
            />
          }
        >
          <View style={styles.emptyState}>
            <Ionicons 
              name="document-outline" 
              size={64} 
              color={Colors[colorScheme ?? 'light'].muted} 
              style={{ marginBottom: 16 }}
            />
            <Text style={[styles.emptyStateTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              No Documents Yet
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: Colors[colorScheme ?? 'light'].muted }]}>
              Create your first AI-generated document
            </Text>
             <Pressable 
               onPress={() => router.push('/generator')}
              style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text style={styles.primaryButtonText}>Create Document</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors[colorScheme ?? 'light'].primary}
            />
          }
        >
          {documents.map((doc, index) => (
            <Pressable
              key={doc.id || index}
              style={[styles.documentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => {
                Alert.alert('Unavailable', 'Document detail page has been removed.');
              }}
            >
              <View style={styles.documentHeader}>
                <View style={[styles.documentIcon, { backgroundColor: `${Colors[colorScheme ?? 'light'].primary}20` }]}>
                  <Ionicons 
                    name={getDocumentIcon(doc.doc_type)} 
                    size={20} 
                    color={Colors[colorScheme ?? 'light'].primary} 
                  />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={[styles.documentTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>
                    {doc.title}
                  </Text>
                  <Text style={[styles.documentType, { color: Colors[colorScheme ?? 'light'].muted }]}>
                    {doc.doc_type?.charAt(0)?.toUpperCase() + doc.doc_type?.slice(1) || 'Document'}
                  </Text>
                </View>
                <View style={styles.documentMeta}>
                  <Text style={[styles.documentDate, { color: Colors[colorScheme ?? 'light'].muted }]}>
                    {formatDate(doc.created_at || doc.updated_at || new Date().toISOString())}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors[colorScheme ?? 'light'].muted} />
                </View>
              </View>
              
              {doc.content && (
                <Text 
                  style={[styles.documentPreview, { color: Colors[colorScheme ?? 'light'].muted }]} 
                  numberOfLines={2}
                >
                  {doc.content.substring(0, 120)}...
                </Text>
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    maxWidth: 320,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  documentCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentType: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  documentMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  documentDate: {
    fontSize: 12,
  },
  documentPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    paddingLeft: 52, // Align with title
  },
});
