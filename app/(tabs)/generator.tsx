import React, { useState, useRef } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { createDocument, generateDocument, exportDocument, convertDocumentFile } from '@/lib/api';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function GeneratorScreen() {
  const theme = Colors['light'];
  const [docType, setDocType] = useState('resume');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | undefined>();
  const [downloadFormat, setDownloadFormat] = useState('docx');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [lastSavedId, setLastSavedId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const onGenerate = async (save = false) => {
    setLoading(true); setMsg(undefined); setPreview(null);
    try {
      const doc = { doc_type: docType, title: title || undefined, prompt: content };
      if (generateDocument) {
        const res = await generateDocument({ doc_type: docType, title: title || '', prompt: content });
        const text = (res?.content || res?.text || res?.result || JSON.stringify(res)).toString();
        setPreview(text);
        if (res?.id) setLastSavedId(res.id as number);
        if (save) {
          if (!res?.id) {
            const saved = await createDocument({ doc_type: docType, title: title || '', content: text });
            if (saved?.id) setLastSavedId(saved.id as number);
          }
          setMsg('Saved to history');
        }
      } else {
        await createDocument({ doc_type: docType, title: title || '', content });
        setMsg('Saved');
      }
    } catch (e: any) {
      setMsg(e?.message || 'Failed to generate');
    } finally { setLoading(false); }
  };

  const downloadPreview = async (format: string) => {
    if (!preview) { setMsg('No preview to download'); return; }
    try {
      if (format === 'txt') {
        const blob = new Blob([preview], { type: 'text/plain;charset=utf-8' });
        if (Platform.OS === 'web') {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = (title || 'document') + '.txt';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          setMsg('Download started');
        }
        return;
      }
      if (format === 'json') {
        const obj = { title, content: preview };
        const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
        if (Platform.OS === 'web') {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = (title || 'document') + '.json';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          setMsg('Download started');
        }
        return;
      }
      if (lastSavedId) {
        try {
          const resp = await exportDocument(lastSavedId, format);
          if (Platform.OS === 'web') {
            const blob = new Blob([resp.data], { type: resp.headers?.['content-type'] || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (title || `document-${lastSavedId}`) + `.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            setMsg('Download started');
          }
        } catch (e: any) { 
          setMsg('Server export failed: ' + (e?.message || e)); 
          if (format === 'docx') {
            try {
              const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Spacing } = await import('docx');
              const doc = new Document({
                sections: [{
                  properties: {},
                  children: [
                    new Paragraph({
                      text: title || 'Document',
                      heading: HeadingLevel.HEADING_1,
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        after: 400,
                        before: 200
                      }
                    }),
                    new Paragraph({
                      text: docType.replace('_', ' ').toUpperCase(),
                      heading: HeadingLevel.HEADING_2,
                      alignment: AlignmentType.CENTER,
                      spacing: {
                        after: 300,
                        before: 100
                      }
                    }),
                    ...(preview || '').split('\n\n')
                      .filter(paragraph => paragraph.trim().length > 0)
                      .map(paragraph => 
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: paragraph.trim(),
                              size: 24,
                              font: 'Calibri'
                            })
                          ],
                          spacing: {
                            after: 200,
                            before: 100
                          },
                          alignment: AlignmentType.JUSTIFIED
                        })
                      )
                  ]
                }]
              });
              const blob = await Packer.toBlob(doc);
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = (title || 'document') + '.docx';
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
              setMsg('DOC file generated and downloaded');
            } catch (docError: any) {
              setMsg('DOC generation failed: ' + (docError?.message || docError));
            }
          }
          // PDF export removed per current requirements; show message instead
          if (format === 'pdf') {
            setMsg('PDF export is currently disabled. Please use TXT, DOC, or JSON.');
          }
        }
        return;
      }
      if (format === 'docx') {
        try {
          const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Spacing } = await import('docx');
          const doc = new Document({
            sections: [{
              properties: {},
              children: [
                new Paragraph({
                  text: title || 'Document',
                  heading: HeadingLevel.HEADING_1,
                  alignment: AlignmentType.CENTER,
                  spacing: {
                    after: 400,
                    before: 200
                  }
                }),
                new Paragraph({
                  text: docType.replace('_', ' ').toUpperCase(),
                  heading: HeadingLevel.HEADING_2,
                  alignment: AlignmentType.CENTER,
                  spacing: {
                    after: 300,
                    before: 100
                  }
                }),
                ...(preview || '').split('\n\n')
                  .filter(paragraph => paragraph.trim().length > 0)
                  .map(paragraph => 
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: paragraph.trim(),
                          size: 24,
                          font: 'Calibri'
                        })
                      ],
                      spacing: {
                        after: 200,
                        before: 100
                      },
                      alignment: AlignmentType.JUSTIFIED
                    })
                  )
              ]
            }]
          });
          const blob = await Packer.toBlob(doc);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = (title || 'document') + '.docx';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          setMsg('DOC file generated and downloaded');
        } catch (docError: any) {
          setMsg('DOC generation failed: ' + (docError?.message || docError));
        }
        return;
      }
      if (format === 'pdf') {
        setMsg('PDF export is currently disabled. Please use TXT, DOC, or JSON.');
        return;
      }
      setMsg('Unable to export this format from preview. Save the document first to enable PDF/DOCX/PPTX export.');
    } catch (e: any) { setMsg('Download error: ' + (e?.message || e)); }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).clipboard?.writeText) {
        await (navigator as any).clipboard.writeText(text);
      } else {
        try {
          const Clipboard = await import('expo-clipboard');
          await Clipboard.setStringAsync(text);
        } catch (e) {
          console.warn('Clipboard not available', e);
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const canPreview = content.trim().length > 0 && !loading;
  const canSave = Boolean(preview && preview.trim().length > 0) && !loading;

  const presets = [
    { label: 'Resume', type: 'resume', prompt: 'Write a professional resume highlighting experience and skills.', icon: 'document-text' },
    { label: 'Cover Letter', type: 'cover_letter', prompt: 'Write a concise cover letter tailored to a product manager role.', icon: 'mail' },
    { label: 'Report', type: 'report', prompt: 'Create a short report summary with bullet points and conclusion.', icon: 'analytics' },
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.mainTitle}>Smart Document Generator</Text>
          <Text style={styles.subtitle}>Create professional documents with AI assistance</Text>
        </View>
        <View style={styles.headerDecoration} />
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

      {/* Main Form Card */}
      <View style={styles.mainCard}>
        {/* Quick Templates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Templates</Text>
          <View style={styles.presetsContainer}>
            {presets.map(p => (
              <Pressable 
                key={p.type} 
                style={[
                  styles.presetCard,
                  docType === p.type && styles.presetCardActive
                ]} 
                onPress={() => { setDocType(p.type); setContent(p.prompt); }}
              >
                <Ionicons 
                  name={p.icon as any} 
                  size={24} 
                  color={docType === p.type ? '#ffffff' : '#6b7280'} 
                />
                <Text style={[
                  styles.presetLabel,
                  docType === p.type && styles.presetLabelActive
                ]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Document Type Input */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Document Type</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="document" size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput 
              value={docType} 
              onChangeText={setDocType} 
              placeholder="resume, report, letter" 
              style={styles.textInput}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Document Title</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="create" size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput 
              value={title} 
              onChangeText={setTitle} 
              placeholder="Enter a title for your document" 
              style={styles.textInput}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Describe what you want</Text>
          <View style={styles.textareaContainer}>
            <TextInput 
              value={content} 
              onChangeText={setContent} 
              placeholder="Provide detailed instructions or prompts for your document..." 
              multiline 
              numberOfLines={6} 
              style={styles.textarea}
              placeholderTextColor="#9ca3af"
              textAlignVertical="top"
            />
            <View style={styles.characterCount}>
              <Text style={styles.characterCountText}>{content.length} characters</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable 
            style={[styles.button, styles.secondaryButton, !canPreview && styles.buttonDisabled]} 
            onPress={() => onGenerate(false)} 
            disabled={!canPreview}
          >
            {loading ? (
              <ActivityIndicator color="#6b7280" size="small" />
            ) : (
              <>
                <Ionicons name="eye" size={18} color="#6b7280" />
                <Text style={styles.secondaryButtonText}>Preview</Text>
              </>
            )}
          </Pressable>
          
          <Pressable 
            style={[styles.button, styles.primaryButton, !canSave && styles.buttonDisabled]} 
            onPress={() => onGenerate(true)} 
            disabled={!canSave}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Ionicons name="save" size={18} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Save & Generate</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* Preview Section */}
      {preview !== null && (
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.previewHeaderLeft}>
              <Ionicons name="document-text" size={24} color="#6b7280" />
              <Text style={styles.previewTitle}>Generated Preview</Text>
            </View>
            <View style={styles.previewActions}>
              <Pressable 
                onPress={() => preview && copyToClipboard(preview)} 
                style={[styles.iconButton, copied && styles.iconButtonActive]}
              >
                <Ionicons 
                  name={copied ? "checkmark" : "copy-outline"} 
                  size={18} 
                  color={copied ? "#10b981" : "#6b7280"} 
                />
              </Pressable>
              <Pressable 
                onPress={() => { setPreview(null); setMsg(undefined); }} 
                style={styles.iconButton}
              >
                <Ionicons name="close-outline" size={18} color="#6b7280" />
              </Pressable>
            </View>
          </View>
          
          <View style={styles.previewContent}>
            <Text style={styles.previewText}>{preview}</Text>
          </View>

          {/* Download Section */}
          <View style={styles.downloadSection}>
            <Text style={styles.downloadTitle}>Download as</Text>
            <View style={styles.formatSelector}>
              {[
                { key: 'txt', label: 'TXT', icon: 'document-text' },
                { key: 'json', label: 'JSON', icon: 'code' },
                { key: 'pdf', label: 'PDF', icon: 'document' },
                { key: 'docx', label: 'DOC', icon: 'document-text' }
              ].map(format => (
                <Pressable 
                  key={format.key}
                  style={[
                    styles.formatChip,
                    downloadFormat === format.key && styles.formatChipActive
                  ]} 
                  onPress={() => setDownloadFormat(format.key)}
                >
                  <Ionicons 
                    name={format.icon as any} 
                    size={16} 
                    color={downloadFormat === format.key ? '#ffffff' : '#6b7280'} 
                  />
                  <Text style={[
                    styles.formatChipText,
                    downloadFormat === format.key && styles.formatChipTextActive
                  ]}>
                    {format.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            
            <Pressable 
              style={styles.downloadButton} 
              onPress={() => downloadPreview(downloadFormat)}
            >
              <Ionicons name="download" size={20} color="#ffffff" />
              <Text style={styles.downloadButtonText}>Download {downloadFormat.toUpperCase()}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  headerDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  successMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  errorMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  messageText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  successText: {
    color: '#10b981',
  },
  errorText: {
    color: '#ef4444',
  },
  mainCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  presetsContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  presetCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  presetCardActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    transform: [{ scale: 1.02 }],
  },
  presetLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  presetLabelActive: {
    color: '#ffffff',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  textareaContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  textarea: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    minHeight: 120,
    lineHeight: 24,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  characterCountText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    shadowColor: '#667eea',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  previewCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  previewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  iconButtonActive: {
    backgroundColor: '#d1fae5',
  },
  previewContent: {
    padding: 24,
    maxHeight: 300,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    fontWeight: '500',
  },
  downloadSection: {
    padding: 24,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  formatSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  formatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  formatChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  formatChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  formatChipTextActive: {
    color: '#ffffff',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
