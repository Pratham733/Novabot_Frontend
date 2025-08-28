import React, { useContext, useState } from 'react';
import { StyleSheet, TextInput, ScrollView, View as RNView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { AuthContext } from '@/context/AuthContext';
import { createDocument, regenerateDocument, finalizeDocument } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Link } from 'expo-router';

export default function GeneratorTab() {
  const { user, token } = useContext(AuthContext);
  const colorScheme = useColorScheme();
  const [docType, setDocType] = useState('report');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const docTypes = [
    { id: 'report', label: 'Report', icon: 'document-text' },
    { id: 'email', label: 'Email', icon: 'mail' },
    { id: 'proposal', label: 'Proposal', icon: 'bulb' },
    { id: 'summary', label: 'Summary', icon: 'list' },
    { id: 'article', label: 'Article', icon: 'newspaper' },
    { id: 'letter', label: 'Letter', icon: 'chatbox' },
  ];

  const handleGenerate = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const doc = await createDocument({
        doc_type: docType,
        title: title.trim(),
        content: content.trim(),
      });

      // Auto-finalize the document to get AI-enhanced version
      const finalized = await finalizeDocument(doc.id);
      setResult(finalized);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!result?.id) return;

    setLoading(true);
    setError('');

    try {
      const regenerated = await regenerateDocument(result.id, instructions || undefined);
      setResult(regenerated);
      setInstructions(''); // Clear instructions after use
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to regenerate document');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.emptyStateCard}>
          <Ionicons 
            name="document-text-outline" 
            size={64} 
            color={Colors[colorScheme ?? 'light'].muted} 
            style={{ marginBottom: 16 }}
          />
          <Text style={[styles.emptyStateTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Document Generator
          </Text>
          <Text style={[styles.emptyStateSubtitle, { color: Colors[colorScheme ?? 'light'].muted }]}>
            Sign in to create AI-powered documents
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

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <Ionicons name="create" size={24} color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Document Generator
          </Text>
          <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].muted }]}>
            Create professional documents with AI
          </Text>
        </View>

        {/* Document Type Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Document Type
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
            {docTypes.map((type) => (
              <Pressable
                key={type.id}
                onPress={() => setDocType(type.id)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: docType === type.id 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].card,
                    borderColor: Colors[colorScheme ?? 'light'].border,
                  }
                ]}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={18} 
                  color={docType === type.id ? 'white' : Colors[colorScheme ?? 'light'].text} 
                />
                <Text style={[
                  styles.typeChipText,
                  { 
                    color: docType === type.id ? 'white' : Colors[colorScheme ?? 'light'].text 
                  }
                ]}>
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Input Form */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Title
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: Colors[colorScheme ?? 'light'].card,
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].border,
            }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter document title..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].muted}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Content / Instructions
          </Text>
          <TextInput
            style={[styles.textArea, { 
              backgroundColor: Colors[colorScheme ?? 'light'].card,
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].border,
            }]}
            value={content}
            onChangeText={setContent}
            placeholder="Describe what you want the document to contain..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].muted}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Error Display */}
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
          disabled={loading || !title.trim() || !content.trim()}
          style={[
            styles.generateButton,
            {
              backgroundColor: loading || !title.trim() || !content.trim()
                ? Colors[colorScheme ?? 'light'].muted
                : Colors[colorScheme ?? 'light'].primary
            }
          ]}
        >
          <Ionicons 
            name={loading ? "hourglass" : "sparkles"} 
            size={20} 
            color="white" 
          />
          <Text style={styles.generateButtonText}>
            {loading ? 'Generating...' : 'Generate Document'}
          </Text>
        </Pressable>

        {/* Result */}
        {result && (
          <View style={styles.section}>
            <View style={styles.resultHeader}>
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Generated Document
              </Text>
              <Ionicons name="checkmark-circle" size={20} color={Colors[colorScheme ?? 'light'].success} />
            </View>
            
            <View style={[styles.resultContainer, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Text style={[styles.resultTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                {result.title}
              </Text>
              <ScrollView style={styles.resultContent} nestedScrollEnabled>
                <Text style={[styles.resultText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {result.content}
                </Text>
              </ScrollView>
            </View>

            {/* Regenerate Section */}
            <View style={styles.regenerateSection}>
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Refine Document
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: Colors[colorScheme ?? 'light'].card,
                  color: Colors[colorScheme ?? 'light'].text,
                  borderColor: Colors[colorScheme ?? 'light'].border,
                }]}
                value={instructions}
                onChangeText={setInstructions}
                placeholder="Add specific instructions for improvement..."
                placeholderTextColor={Colors[colorScheme ?? 'light'].muted}
              />
              <Pressable
                onPress={handleRegenerate}
                disabled={loading}
                style={[
                  styles.regenerateButton,
                  {
                    backgroundColor: loading 
                      ? Colors[colorScheme ?? 'light'].muted
                      : Colors[colorScheme ?? 'light'].secondary
                  }
                ]}
              >
                <Ionicons 
                  name={loading ? "hourglass" : "refresh"} 
                  size={18} 
                  color="white" 
                />
                <Text style={styles.regenerateButtonText}>
                  {loading ? 'Regenerating...' : 'Regenerate'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    margin: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    height: 120,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultContainer: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultContent: {
    maxHeight: 200,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
  regenerateSection: {
    marginTop: 16,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    marginTop: 8,
  },
  regenerateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
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
});
