import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Platform, ScrollView, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { generateDocument, createDocument } from '@/lib/api';
import * as DocumentPicker from 'expo-document-picker';

interface DocumentTemplate {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  prompt: string;
  category: string;
}

export default function GeneratorPage() {
  const { user } = useAuth();
  const [docType, setDocType] = useState('resume');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  const documentTypes = [
    { id: 'resume', label: 'Resume', icon: 'document-text', color: '#3b82f6' },
    { id: 'cover_letter', label: 'Cover Letter', icon: 'mail', color: '#10b981' },
    { id: 'report', label: 'Report', icon: 'analytics', color: '#f59e0b' },
    { id: 'proposal', label: 'Proposal', icon: 'bulb', color: '#8b5cf6' },
    { id: 'email', label: 'Email', icon: 'mail-open', color: '#ef4444' },
    { id: 'summary', label: 'Summary', icon: 'list', color: '#06b6d4' },
    { id: 'presentation', label: 'Presentation', icon: 'easel', color: '#ec4899' },
    { id: 'contract', label: 'Contract', icon: 'document', color: '#059669' },
  ];

  const documentTemplates: DocumentTemplate[] = [
    {
      id: 'resume_tech',
      label: 'Tech Resume',
      description: 'Professional resume for tech roles',
      icon: 'code',
      color: '#3b82f6',
      prompt: 'Create a professional tech resume highlighting software development skills, projects, and experience. Include sections for technical skills, work experience, education, and projects.',
      category: 'resume'
    },
    {
      id: 'resume_creative',
      label: 'Creative Resume',
      description: 'Creative and artistic resume template',
      icon: 'brush',
      color: '#ec4899',
      prompt: 'Design a creative resume for a creative professional. Make it visually appealing with creative sections and artistic elements.',
      category: 'resume'
    },
    {
      id: 'cover_letter_tech',
      label: 'Tech Cover Letter',
      description: 'Cover letter for technology positions',
      icon: 'mail',
      color: '#10b981',
      prompt: 'Write a compelling cover letter for a software engineering position. Highlight technical skills, passion for technology, and relevant experience.',
      category: 'cover_letter'
    },
    {
      id: 'business_proposal',
      label: 'Business Proposal',
      description: 'Professional business proposal template',
      icon: 'briefcase',
      color: '#f59e0b',
      prompt: 'Create a comprehensive business proposal including executive summary, problem statement, solution, market analysis, and financial projections.',
      category: 'proposal'
    },
    {
      id: 'project_report',
      label: 'Project Report',
      description: 'Detailed project status report',
      icon: 'analytics',
      color: '#8b5cf6',
      prompt: 'Write a detailed project report including objectives, methodology, results, conclusions, and recommendations.',
      category: 'report'
    },
    {
      id: 'email_template',
      label: 'Professional Email',
      description: 'Business email template',
      icon: 'mail-open',
      color: '#ef4444',
      prompt: 'Create a professional business email template that is clear, concise, and professional in tone.',
      category: 'email'
    }
  ];

  const presets = [
    { label: 'Resume', type: 'resume', prompt: 'Write a professional resume highlighting experience and skills.', icon: 'document-text' },
    { label: 'Cover Letter', type: 'cover_letter', prompt: 'Write a concise cover letter tailored to a product manager role.', icon: 'mail' },
    { label: 'Report', type: 'report', prompt: 'Create a short report summary with bullet points and conclusion.', icon: 'analytics' },
  ];

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setMsg('Please enter a prompt for document generation');
      return;
    }

    setLoading(true);
    setMsg('');

    try {
      const result = await generateDocument({
        doc_type: docType,
        title: title || 'Generated Document',
        prompt: prompt.trim(),
      });

      if (result.content) {
        setPreview(result.content);
        setContent(result.content);
        setMsg('Document generated successfully!');
      } else {
        setMsg('Failed to generate document. Please try again.');
      }
    } catch (error: any) {
      setMsg(`Generation failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [docType, title, prompt]);

  const handleSave = useCallback(async () => {
    if (!preview.trim()) {
      setMsg('No content to save');
      return;
    }

    try {
      await createDocument({
        doc_type: docType,
        title: title || 'Generated Document',
        content: preview.trim(),
      });
      setMsg('Document saved successfully!');
    } catch (error: any) {
      setMsg(`Save failed: ${error?.message || 'Unknown error'}`);
    }
  }, [docType, title, preview]);

  const handlePreset = (preset: any) => {
    setDocType(preset.type);
    setPrompt(preset.prompt);
    setTitle(preset.label);
  };

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setDocType(template.category);
    setPrompt(template.prompt);
    setTitle(template.label);
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(text);
      } else {
        const Clipboard = await import('expo-clipboard');
        await Clipboard.setStringAsync(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const shareDocument = async () => {
    if (!preview.trim()) {
      Alert.alert('Info', 'No document to share');
      return;
    }

    try {
      await Share.share({
        message: `Document: ${title || 'Generated Document'}\n\n${preview}`,
        title: 'NovaBot Document'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share document');
    }
  };

  const exportDocument = async (format: 'txt' | 'doc' | 'json') => {
    if (!preview.trim()) {
      Alert.alert('Info', 'No document to export');
      return;
    }

    // Web: trigger download; Native: fall back to share
    const filenameBase = (title || 'document').replace(/[^a-z0-9\-\_]+/gi, '_').toLowerCase();
    if (Platform.OS === 'web') {
      try {
        let blob: Blob;
        let filename = `${filenameBase}`;
        if (format === 'txt') {
          blob = new Blob([preview], { type: 'text/plain;charset=utf-8' });
          filename += '.txt';
        } else if (format === 'json') {
          const json = JSON.stringify({ title: title || 'Document', type: docType, content: preview }, null, 2);
          blob = new Blob([json], { type: 'application/json;charset=utf-8' });
          filename += '.json';
        } else {
          // Simple .doc as plain text with minimal header for compatibility
          const docContent = preview;
          blob = new Blob([docContent], { type: 'application/msword' });
          filename += '.doc';
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setMsg('File downloaded');
      } catch (e: any) {
        setMsg('Export failed: ' + (e?.message || String(e)));
      }
    } else {
      // Native fallback: share as text
      await shareDocument();
    }
  };

  const canGenerate = prompt.trim().length > 0 && !loading;
  const canSave = preview.trim().length > 0 && !loading;

  return (
    <Layout 
      title="Document Generator" 
      subtitle="Create professional documents with AI assistance"
    >
      {/* Document Templates Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Templates</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
          {documentTemplates.map((template) => (
            <Pressable 
              key={template.id} 
              style={[
                styles.templateCard,
                selectedTemplate?.id === template.id && styles.selectedTemplateCard
              ]}
              onPress={() => handleTemplateSelect(template)}
            >
              <View style={[styles.templateIcon, { backgroundColor: `${template.color}20` }]}>
                <Ionicons name={template.icon as any} size={24} color={template.color} />
              </View>
              <Text style={styles.templateLabel}>{template.label}</Text>
              <Text style={styles.templateDescription}>{template.description}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Quick Templates Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Templates</Text>
        <View style={styles.presetsContainer}>
          {presets.map((preset) => (
            <Pressable 
              key={preset.type} 
              style={styles.presetCard}
              onPress={() => handlePreset(preset)}
            >
              <Ionicons name={preset.icon as any} size={24} color="#3b82f6" />
              <Text style={styles.presetLabel}>{preset.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Message Display */}
      {msg && (
        <View style={[styles.messageContainer, msg.includes('failed') ? styles.errorMessage : styles.successMessage]}>
          <Ionicons 
            name={msg.includes('failed') ? 'alert-circle' : 'checkmark-circle'} 
            size={20} 
            color={msg.includes('failed') ? '#ef4444' : '#10b981'} 
          />
          <Text style={[styles.messageText, msg.includes('failed') ? styles.errorText : styles.successText]}>
            {msg}
          </Text>
        </View>
      )}

      {/* Main Form */}
      <View style={styles.mainCard}>
        {/* Document Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Type</Text>
          <View style={styles.typeGrid}>
            {documentTypes.map((type) => (
              <Pressable
                key={type.id}
                style={[
                  styles.typeCard,
                  docType === type.id && styles.activeTypeCard
                ]}
                onPress={() => setDocType(type.id)}
              >
                <View style={[styles.typeIcon, { backgroundColor: `${type.color}20` }]}>
                  <Ionicons name={type.icon as any} size={24} color={type.color} />
                </View>
                <Text style={styles.typeLabel}>{type.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter document title..."
            placeholderTextColor="#64748b"
          />
        </View>

        {/* Prompt Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generation Prompt</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Describe what you want to generate..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.primaryButton, !canGenerate && styles.disabledButton]}
            onPress={handleGenerate}
            disabled={!canGenerate}
          >
            <Ionicons name="sparkles" size={20} color="#ffffff" />
            <Text style={styles.buttonText}>
              {loading ? 'Generating...' : 'Generate Document'}
            </Text>
          </Pressable>

          {canSave && (
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={handleSave}
            >
              <Ionicons name="save" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Save Document</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Preview Section */}
      {preview && (
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Generated Content</Text>
            <View style={styles.previewActions}>
              <Pressable
                style={styles.actionButton}
                onPress={() => copyToClipboard(preview)}
              >
                <Ionicons name={copied ? 'checkmark' : 'copy'} size={20} color="#3b82f6" />
                <Text style={styles.actionButtonText}>
                  {copied ? 'Copied!' : 'Copy'}
                </Text>
              </Pressable>
              
              <Pressable
                style={styles.actionButton}
                onPress={() => shareDocument()}
              >
                <Ionicons name="share" size={20} color="#10b981" />
                <Text style={styles.actionButtonText}>Share</Text>
              </Pressable>
            </View>
          </View>
          
          <View style={styles.previewContent}>
            <Text style={styles.previewText}>{preview}</Text>
          </View>

          {/* Export Options */}
          <View style={styles.exportSection}>
            <Text style={styles.exportTitle}>Export Options</Text>
            <View style={styles.exportButtons}>
              <Pressable
                style={styles.exportButton}
                onPress={() => exportDocument('txt')}
              >
                <Ionicons name="document-text" size={20} color="#3b82f6" />
                <Text style={styles.exportButtonText}>Export as TXT</Text>
              </Pressable>

              <Pressable
                style={styles.exportButton}
                onPress={() => exportDocument('doc')}
              >
                <Ionicons name="document" size={20} color="#10b981" />
                <Text style={styles.exportButtonText}>Export as DOC</Text>
              </Pressable>

              <Pressable
                style={styles.exportButton}
                onPress={() => exportDocument('json')}
              >
                <Ionicons name="code-slash" size={20} color="#f59e0b" />
                <Text style={styles.exportButtonText}>Export as JSON</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
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
  templatesScroll: {
    marginBottom: 8,
  },
  templateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 180,
    alignItems: 'center',
  },
  selectedTemplateCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  templateDescription: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    minWidth: 160,
  },
  presetLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  errorMessage: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  successMessage: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  messageText: {
    fontSize: 16,
    color: '#10b981',
    flex: 1,
  },
  errorText: {
    color: '#ef4444',
  },
  successText: {
    color: '#10b981',
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 32,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  typeCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTypeCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  textArea: {
    height: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#10b981',
  },
  disabledButton: {
    backgroundColor: '#64748b',
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  previewContent: {
    padding: 20,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#e2e8f0',
  },
  exportSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
    flex: 1,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
