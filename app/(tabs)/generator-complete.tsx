import React, { useContext, useState } from 'react';
import { StyleSheet, ScrollView, View as RNView, Pressable, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { AuthContext } from '@/context/AuthContext';
import { generateDocument } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

const documentTypes = [
  { id: 'report', label: 'Report', icon: 'document-text', color: '#3B82F6' },
  { id: 'email', label: 'Email', icon: 'mail', color: '#10B981' },
  { id: 'proposal', label: 'Proposal', icon: 'bulb', color: '#F59E0B' },
  { id: 'summary', label: 'Summary', icon: 'list', color: '#8B5CF6' },
  { id: 'article', label: 'Article', icon: 'newspaper', color: '#EF4444' },
  { id: 'letter', label: 'Letter', icon: 'chatbox', color: '#06B6D4' },
];

export default function GeneratorTab() {
  const { user } = useContext(AuthContext);
  const colorScheme = useColorScheme();
  const [selectedType, setSelectedType] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
    if (!selectedType || !title.trim() || !prompt.trim()) {
      Alert.alert('Missing Information', 'Please select a document type, enter a title, and provide a description.');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const response = await generateDocument({
        doc_type: selectedType,
        title: title.trim(),
        prompt: prompt.trim(),
      });

      setResult(response);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to generate document');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setResult(null);
    setError('');
  };

  const handleViewDocument = () => {
    // Document detail page removed; could integrate inline view or future route.
    Alert.alert('View Unavailable', 'Document detail page has been removed.');
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.authPromptCard}>
          <Ionicons 
            name="create-outline" 
            size={64} 
            color={Colors[colorScheme ?? 'light'].muted} 
            style={{ marginBottom: 16 }}
          />
          <Text style={[styles.authTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            AI Document Generator
          </Text>
          <Text style={[styles.authSubtitle, { color: Colors[colorScheme ?? 'light'].muted }]}>
            Sign in to create AI-generated documents
          </Text>
          <Pressable 
            onPress={() => router.push('/auth')}
            style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (result) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <View style={styles.headerContent}>
            <Pressable onPress={handleRegenerate} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={Colors[colorScheme ?? 'light'].text} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Generated Document
              </Text>
              <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].muted }]}>
                {result.doc_type?.charAt(0)?.toUpperCase() + result.doc_type?.slice(1)}
              </Text>
            </View>
            <Pressable 
              onPress={handleViewDocument}
              style={[styles.viewButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            >
              <Ionicons name="eye" size={16} color="white" />
              <Text style={styles.viewButtonText}>View</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.resultContainer}>
          <View style={[styles.resultCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.resultTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              {result.title}
            </Text>
            <Text style={[styles.resultContent, { color: Colors[colorScheme ?? 'light'].text }]}>
              {result.content}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <Pressable 
              onPress={handleRegenerate}
              style={[styles.regenerateButton, { borderColor: Colors[colorScheme ?? 'light'].primary }]}
            >
              <Ionicons name="refresh" size={16} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.regenerateButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                Generate New
              </Text>
            </Pressable>
            <Pressable 
              onPress={handleViewDocument}
              style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            >
              <Ionicons name="eye" size={16} color="white" />
              <Text style={styles.primaryButtonText}>View Full</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              AI Generator
            </Text>
            <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].muted }]}>
              Create professional documents with AI
            </Text>
          </View>
          <View style={[styles.aiIcon, { backgroundColor: `${Colors[colorScheme ?? 'light'].primary}20` }]}>
            <Ionicons name="sparkles" size={20} color={Colors[colorScheme ?? 'light'].primary} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Document Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Document Type
          </Text>
          <View style={styles.typeGrid}>
            {documentTypes.map((type) => (
              <Pressable
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                style={[
                  styles.typeCard,
                  {
                    backgroundColor: selectedType === type.id 
                      ? `${type.color}15` 
                      : Colors[colorScheme ?? 'light'].card,
                    borderColor: selectedType === type.id ? type.color : 'transparent',
                  }
                ]}
              >
                <View style={[styles.typeIcon, { backgroundColor: `${type.color}20` }]}>
                  <Ionicons name={type.icon as any} size={20} color={type.color} />
                </View>
                <Text style={[
                  styles.typeLabel,
                  { 
                    color: selectedType === type.id 
                      ? type.color 
                      : Colors[colorScheme ?? 'light'].text 
                  }
                ]}>
                  {type.label}
                </Text>
                {selectedType === type.id && (
                  <Ionicons name="checkmark-circle" size={16} color={type.color} style={styles.selectedIcon} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Document Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter the title for your document"
            placeholderTextColor={Colors[colorScheme ?? 'light'].muted}
            style={[
              styles.textInput,
              {
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                color: Colors[colorScheme ?? 'light'].text,
                borderColor: Colors[colorScheme ?? 'light'].border,
              }
            ]}
          />
        </View>

        {/* Prompt Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Description & Requirements
          </Text>
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Describe what you want the document to contain, any specific requirements, tone, length, etc."
            placeholderTextColor={Colors[colorScheme ?? 'light'].muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[
              styles.textArea,
              {
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                color: Colors[colorScheme ?? 'light'].text,
                borderColor: Colors[colorScheme ?? 'light'].border,
              }
            ]}
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={Colors[colorScheme ?? 'light'].error} />
            <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Generate Button */}
        <Pressable
          onPress={handleGenerate}
          disabled={generating || !selectedType || !title.trim() || !prompt.trim()}
          style={[
            styles.generateButton,
            {
              backgroundColor: generating || !selectedType || !title.trim() || !prompt.trim()
                ? Colors[colorScheme ?? 'light'].muted
                : Colors[colorScheme ?? 'light'].primary,
            }
          ]}
        >
          {generating ? (
            <>
              <Ionicons name="hourglass" size={16} color="white" />
              <Text style={styles.generateButtonText}>Generating...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={16} color="white" />
              <Text style={styles.generateButtonText}>Generate Document</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  authPromptCard: {
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
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  formContainer: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
  resultContainer: {
    padding: 16,
    gap: 20,
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  regenerateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  regenerateButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
