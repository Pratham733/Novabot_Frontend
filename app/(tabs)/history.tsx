import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { listDocuments, exportDocument } from '@/lib/api';
import Layout from '@/components/Layout';

export default function HistoryScreen() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await listDocuments();
      const docsArray = Array.isArray(docs) ? docs : docs.results || [];
      // Sort by creation date (newest first)
      const sortedDocs = docsArray.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setDocuments(sortedDocs);
    } catch (error) {
      // Suppressed fetch error (optional: add monitoring)
    } finally {
      setIsLoading(false);
    }
  };

  const filterDocumentsByTimeframe = () => {
    if (selectedTimeframe === 'all') return documents;
    
    const now = new Date();
    const timeframeMap: { [key: string]: number } = {
      today: 1,
      week: 7,
      month: 30,
      year: 365,
    };
    
    const daysAgo = timeframeMap[selectedTimeframe];
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    return documents.filter(doc => new Date(doc.created_at) >= cutoffDate);
  };

  const getTimeframeLabel = (timeframe: string) => {
    const labels: { [key: string]: string } = {
      all: 'All Time',
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      year: 'This Year',
    };
    return labels[timeframe] || timeframe;
  };

  const getDocumentIcon = (docType: string) => {
    const iconMap: { [key: string]: string } = {
      resume: 'person',
      cover_letter: 'mail',
      report: 'analytics',
      note: 'document-text',
      letter: 'mail-open',
      proposal: 'briefcase',
      essay: 'school',
      article: 'newspaper',
    };
    return iconMap[docType] || 'document-text';
  };

  const getDocumentColor = (docType: string) => {
    const colorMap: { [key: string]: string } = {
      resume: '#667eea',
      cover_letter: '#10b981',
      report: '#f59e0b',
      note: '#8b5cf6',
      letter: '#ef4444',
      proposal: '#06b6d4',
      essay: '#84cc16',
      article: '#f97316',
    };
    return colorMap[docType] || '#6b7280';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const timeframes = [
    { key: 'all', label: 'All Time', icon: 'apps' },
    { key: 'today', label: 'Today', icon: 'today' },
    { key: 'week', label: 'Week', icon: 'calendar' },
    { key: 'month', label: 'Month', icon: 'calendar-outline' },
    { key: 'year', label: 'Year', icon: 'calendar-number' },
  ];

  // Allowed export formats (PDF removed per requirements)
  const exportFormats = [
    { key: 'txt', label: 'TXT', icon: 'document-text' },
    { key: 'json', label: 'JSON', icon: 'code' },
    { key: 'doc', label: 'DOC', icon: 'document-text' }, // maps to docx on backend
  ];

  const handleExport = async (docId: number, format: string) => {
    try {
      const backendFormat = format === 'doc' ? 'docx' : format; // backend expects docx
      const response = await exportDocument(docId, backendFormat);
      if (Platform.OS === 'web') {
        const blob = new Blob([response.data], { 
          type: response.headers?.['content-type'] || 'application/octet-stream' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${docId}.${backendFormat}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      // Suppressed export error
    }
  };

  const filteredDocuments = filterDocumentsByTimeframe();

  return (
    <Layout title="Document History" subtitle="Track your document creation journey">
      {isLoading ? (
        <View style={styles.loadingContainerDark}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingTextDark}>Loading your document history...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Filters */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Filter by Time</Text>
              <Pressable style={styles.createBtn} onPress={() => router.push('/generator')}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.createBtnText}>New</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeChipsRow}>
              {timeframes.map(tf => (
                <Pressable key={tf.key} onPress={() => setSelectedTimeframe(tf.key)} style={[styles.timeChip, selectedTimeframe === tf.key && styles.timeChipActive]}>
                  <Ionicons name={tf.icon as any} size={14} color={selectedTimeframe === tf.key ? '#fff' : '#94a3b8'} />
                  <Text style={[styles.timeChipText, selectedTimeframe === tf.key && styles.timeChipTextActive]}>{tf.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Stats */}
            <View style={styles.statsRow}> 
              <View style={styles.statCardDark}>
                <Ionicons name="document-text" size={20} color="#3b82f6" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.statValueDark}>{filteredDocuments.length}</Text>
                  <Text style={styles.statLabelDark}>{getTimeframeLabel(selectedTimeframe)}</Text>
                </View>
              </View>
              <View style={styles.statCardDark}>
                <Ionicons name="trending-up" size={20} color="#10b981" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.statValueDark}>{documents.length > 0 ? Math.round((filteredDocuments.length / documents.length) * 100) : 0}%</Text>
                  <Text style={styles.statLabelDark}>Of Total</Text>
                </View>
              </View>
            </View>

          {/* Timeline */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Document Timeline</Text>
            {filteredDocuments.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="time" size={40} color="#64748b" />
                <Text style={styles.emptyTitle}>No documents in this timeframe</Text>
                <Text style={styles.emptySubtitle}>{selectedTimeframe === 'all' ? 'Create your first document to get started' : `No documents were created ${getTimeframeLabel(selectedTimeframe).toLowerCase()}`}</Text>
                {selectedTimeframe === 'all' && (
                  <Pressable style={styles.primaryBtn} onPress={() => router.push('/generator')}>
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.primaryBtnText}>Create Document</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.timelineDark}>
                {filteredDocuments.map((doc, idx) => (
                  <View key={doc.id || idx} style={styles.timelineItemDark}>
                    {idx < filteredDocuments.length - 1 && <View style={styles.timelineConnectorDark} />}
                    <View style={[styles.timelineDotDark, { backgroundColor: getDocumentColor(doc.doc_type) }]}>
                      <Ionicons name={getDocumentIcon(doc.doc_type) as any} size={14} color="#fff" />
                    </View>
                    <View style={styles.docCardDark}>
                      <View style={styles.docHeaderRow}>
                        <Text style={styles.docTitle}>{doc.title || 'Untitled Document'}</Text>
                        <Text style={styles.docType}>{doc.doc_type?.replace('_',' ') || 'Document'}</Text>
                        <Text style={styles.docDate}>{formatDate(doc.created_at)}</Text>
                      </View>
                      {doc.content && (
                        <Text numberOfLines={3} style={styles.docPreview}>{doc.content}</Text>
                      )}
                      <View style={styles.exportRow}>
                        <Text style={styles.exportLabelDark}>Export:</Text>
                        <View style={styles.exportButtonsRow}>
                          {exportFormats.map(f => (
                            <Pressable key={f.key} style={styles.exportBtnDark} onPress={() => handleExport(doc.id, f.key)}>
                              <Ionicons name={f.icon as any} size={14} color="#3b82f6" />
                              <Text style={styles.exportBtnText}>{f.label}</Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  loadingContainerDark: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingTextDark: { color: '#94a3b8', fontSize: 14, marginTop: 16 },
  sectionCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionHeading: { fontSize: 18, fontWeight: '700', color: '#fff' },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, gap: 6 },
  createBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  timeChipsRow: { gap: 12 },
  timeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  timeChipActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  timeChipText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  timeChipTextActive: { color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 20, marginBottom: 24 },
  statCardDark: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statValueDark: { color: '#fff', fontWeight: '700', fontSize: 20 },
  statLabelDark: { color: '#94a3b8', fontSize: 12, fontWeight: '500' },
  emptyWrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { color: '#94a3b8', fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 8, maxWidth: 500 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, gap: 8, marginTop: 24 },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  timelineDark: { position: 'relative' },
  timelineItemDark: { marginBottom: 28, paddingLeft: 44 },
  timelineConnectorDark: { position: 'absolute', left: 23, top: 14, width: 2, height: '100%', backgroundColor: 'rgba(255,255,255,0.08)' },
  timelineDotDark: { position: 'absolute', left: 14, top: 8, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0f172a' },
  docCardDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  docHeaderRow: { marginBottom: 12 },
  docTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  docType: { color: '#3b82f6', fontSize: 12, fontWeight: '600', textTransform: 'capitalize', marginBottom: 4 },
  docDate: { color: '#94a3b8', fontSize: 11, fontWeight: '500' },
  docPreview: { color: '#cbd5e1', fontSize: 13, lineHeight: 18, fontStyle: 'italic', marginBottom: 12 },
  exportRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exportLabelDark: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginRight: 12 },
  exportButtonsRow: { flexDirection: 'row', gap: 8 },
  exportBtnDark: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59,130,246,0.12)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)', gap: 6 },
  exportBtnText: { color: '#3b82f6', fontSize: 12, fontWeight: '600' },
});
