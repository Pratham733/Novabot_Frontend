import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { API_ROUTES } from '@/constants/config';
import * as Sharing from 'expo-sharing';

interface ConversionFormat {
  id: string;
  label: string;
  icon: string;
  color: string;
  extensions: string[];
}

export default function FileConverterPage() {
  const { user, token } = useAuth() as any;
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [converting, setConverting] = useState(false);
  const [conversionHistory, setConversionHistory] = useState<any[]>([]);
  const [savedConversions, setSavedConversions] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const supportedFormats: ConversionFormat[] = [
    {
      id: 'pdf',
      label: 'PDF',
      icon: 'document',
      color: '#ef4444',
      extensions: ['.doc', '.docx', '.txt', '.rtf', '.html']
    },
    {
      id: 'docx',
      label: 'DOCX',
      icon: 'document-text',
      color: '#3b82f6',
      extensions: ['.pdf', '.txt', '.rtf', '.html']
    },
    {
      id: 'txt',
      label: 'Plain Text',
      icon: 'text',
      color: '#10b981',
      extensions: ['.pdf', '.docx', '.rtf', '.html']
    },
    {
      id: 'html',
      label: 'HTML',
      icon: 'code',
      color: '#f59e0b',
      extensions: ['.pdf', '.docx', '.txt', '.rtf']
    },
    {
      id: 'rtf',
      label: 'RTF',
      icon: 'document-text',
      color: '#8b5cf6',
      extensions: ['.pdf', '.docx', '.txt', '.html']
    }
  ];

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setSelectedFile(file);
        
        // Auto-detect target format based on file extension
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension) {
          const format = supportedFormats.find(f => 
            f.extensions.some(ext => ext.replace('.', '') === extension)
          );
          if (format) {
            setTargetFormat(format.id);
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const fetchSaved = useCallback(async () => {
    if (!token) return;
    setLoadingSaved(true);
    try {
  const resp = await fetch(API_ROUTES.convertedFiles, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resp.ok) {
        const data = await resp.json();
        setSavedConversions(data.results || []);
      }
    } catch {}
    finally { setLoadingSaved(false); }
  }, [token]);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const convertFile = useCallback(async () => {
    if (!selectedFile || !targetFormat) {
      Alert.alert('Error', 'Please select a file and target format');
      return;
    }

    setConverting(true);

    try {
      const form = new FormData();
      // On native (iOS/Android) RN fetch accepts { uri, name, type }. On web we need a real File object.
      if (Platform.OS === 'web') {
        try {
          const blobResp = await fetch(selectedFile.uri);
          const blobData = await blobResp.blob();
          const webFile = new File([blobData], selectedFile.name, { type: selectedFile.mimeType || blobData.type || 'application/octet-stream' });
          form.append('file', webFile);
        } catch (e) {
          Alert.alert('Error', 'Failed to read file in browser');
          setConverting(false);
          return;
        }
      } else {
        form.append('file', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType || 'application/octet-stream'
        } as any);
      }
      form.append('format', targetFormat);
      form.append('persist', 'true');
      const resp = await fetch(API_ROUTES.convert, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      if (!resp.ok) {
        let detail = '';
        try {
          const ct = resp.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              const j = await resp.json();
              detail = j.error || j.detail || JSON.stringify(j).slice(0,200);
            } else {
              detail = await resp.text();
            }
        } catch {}
        throw new Error(detail || `HTTP ${resp.status}`);
      }
      // Try JSON first else treat as blob
      let convertedMeta: any = null;
      let blob: any = null;
      const ct = resp.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        convertedMeta = await resp.json();
      } else {
        blob = await resp.blob();
      }
      const record = {
        id: Date.now().toString(),
        originalName: selectedFile.name,
        originalFormat: selectedFile.name.split('.').pop()?.toLowerCase(),
        targetFormat: targetFormat,
        convertedName: `${selectedFile.name.split('.')[0]}.${targetFormat}`,
        timestamp: new Date(),
      };
      setConversionHistory(prev => [record, ...prev]);
      setSelectedFile(null);
      setTargetFormat('');
      fetchSaved();
      Alert.alert('Success', `File converted to ${targetFormat.toUpperCase()} successfully!`);
    } catch (error: any) {
      Alert.alert('Error', `Failed to convert: ${error.message || 'Unknown error'}`);
    } finally { setConverting(false); }
  }, [selectedFile, targetFormat, token, fetchSaved]);

  const downloadFile = async (file: any) => {
    // Find saved conversion with matching target format and recent
    const saved = savedConversions.find((s: any) => s.original_name === file.originalName && s.target_format === file.targetFormat);
    if (!saved) { Alert.alert('Not Found', 'Saved converted file not found yet.'); return; }
    try {
      const url = saved.download_url;
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        const localUri = FileSystem.documentDirectory + (saved.download_url.split('/').pop() || file.convertedName);
        const dl = await FileSystem.downloadAsync(url, localUri);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(dl.uri);
        } else {
          Alert.alert('Downloaded', 'File saved locally.');
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Download failed');
    }
  };

  const deleteHistory = (fileId: string) => {
    Alert.alert(
      'Delete',
      'Are you sure you want to delete this conversion?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setConversionHistory(prev => prev.filter(f => f.id !== fileId))
        }
      ]
    );
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all conversion history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => setConversionHistory([])
        }
      ]
    );
  };

  return (
    <Layout 
      title="File Converter" 
      subtitle="Convert files between different formats easily"
    >
      {/* File Selection Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select File</Text>
        <View style={styles.fileSelection}>
          {selectedFile ? (
            <View style={styles.selectedFile}>
              <View style={styles.fileInfo}>
                <Ionicons name="document" size={24} color="#3b82f6" />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{selectedFile.name}</Text>
                  <Text style={styles.fileSize}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </Text>
                </View>
              </View>
              <Pressable 
                style={styles.removeButton}
                onPress={() => setSelectedFile(null)}
              >
                <Ionicons name="close" size={20} color="#ef4444" />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.uploadButton} onPress={pickDocument}>
              <Ionicons name="cloud-upload" size={32} color="#3b82f6" />
              <Text style={styles.uploadText}>Choose File to Convert</Text>
              <Text style={styles.uploadSubtext}>
                Supports PDF, DOCX, TXT, RTF, HTML
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Format Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Target Format</Text>
        <View style={styles.formatGrid}>
          {supportedFormats.map((format) => (
            <Pressable
              key={format.id}
              style={[
                styles.formatCard,
                targetFormat === format.id && styles.selectedFormatCard
              ]}
              onPress={() => setTargetFormat(format.id)}
            >
              <View style={[styles.formatIcon, { backgroundColor: `${format.color}20` }]}>
                <Ionicons name={format.icon as any} size={24} color={format.color} />
              </View>
              <Text style={styles.formatLabel}>{format.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Convert Button */}
      {selectedFile && targetFormat && (
        <View style={styles.section}>
          <Pressable
            style={[styles.convertButton, converting && styles.disabledButton]}
            onPress={convertFile}
            disabled={converting}
          >
            <Ionicons 
              name={converting ? "hourglass" : "sync"} 
              size={24} 
              color="#ffffff" 
            />
            <Text style={styles.convertButtonText}>
              {converting ? 'Converting...' : 'Convert File'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Conversion History */}
      <View style={styles.section}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Conversion History</Text>
          {conversionHistory.length > 0 && (
            <Pressable style={styles.clearHistoryButton} onPress={clearHistory}>
              <Ionicons name="trash" size={20} color="#ef4444" />
              <Text style={styles.clearHistoryText}>Clear All</Text>
            </Pressable>
          )}
        </View>
        
        {conversionHistory.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons name="time" size={48} color="#64748b" />
            <Text style={styles.emptyHistoryText}>No conversions yet</Text>
            <Text style={styles.emptyHistorySubtext}>
              Convert your first file to see it here
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
            {conversionHistory.map((file) => (
              <View key={file.id} style={styles.historyItem}>
                <View style={styles.historyInfo}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="document" size={20} color="#3b82f6" />
                  </View>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyFileName}>{file.convertedName}</Text>
                    <Text style={styles.historyDetails}>
                      {file.originalFormat?.toUpperCase()} → {file.targetFormat.toUpperCase()}
                    </Text>
                    <Text style={styles.historyTimestamp}>
                      {file.timestamp.toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.historyActions}>
                  <Pressable 
                    style={styles.downloadButton}
                    onPress={() => downloadFile(file)}
                  >
                    <Ionicons name="download" size={18} color="#10b981" />
                  </Pressable>
                  <Pressable 
                    style={styles.deleteButton}
                    onPress={() => deleteHistory(file.id)}
                  >
                    <Ionicons name="trash" size={18} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            ))}
            {savedConversions.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>Saved on server (auto-deletes after 24h): {savedConversions.length}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  fileSelection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  uploadButton: {
    alignItems: 'center',
    padding: 40,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
    marginTop: 16,
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 16,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#94a3b8',
  },
  removeButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  formatCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedFormatCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  formatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  convertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
  },
  convertButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#64748b',
    opacity: 0.6,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  clearHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyHistoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyDetails: {
    flex: 1,
  },
  historyFileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  historyTimestamp: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  historyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  downloadButton: {
    padding: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
});

