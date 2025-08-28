import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, Platform, KeyboardAvoidingView, Share, Image } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { ChatBubble } from '@/components/ChatBubble';
import { chat } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mood?: string;
}

interface ChatMood {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  tone: 'casual' | 'work' | 'funny' | 'professional';
  examples: string[];
}

export default function ChatPage() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState<ChatMood | null>(null);
  const [conversationName, setConversationName] = useState<string>('');
  const [showMoodExamples, setShowMoodExamples] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [markdownEnabled, setMarkdownEnabled] = useState(true);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string>('');
  const [showDocTip, setShowDocTip] = useState(false);
  const [showImgTip, setShowImgTip] = useState(false);

  const chatMoods: ChatMood[] = [
    {
      id: 'casual',
      label: 'Casual Chat',
      description: 'Friendly, informal conversation',
      icon: 'chatbubbles',
      color: '#10b981',
  tone: 'casual',
      examples: [
        "How's your day going?",
        "Tell me about your weekend",
        "What's your favorite movie?",
        "Share a funny story"
      ]
    },
    {
      id: 'coding',
      label: 'Coding Help',
      description: 'Technical assistance and code review',
      icon: 'code',
      color: '#3b82f6',
  tone: 'work',
      examples: [
        "Help me debug this React component",
        "Explain async/await in JavaScript",
        "Review my Python function",
        "Best practices for API design"
      ]
    },
    {
      id: 'research',
      label: 'Research & Papers',
      description: 'Academic writing and research assistance',
      icon: 'library',
      color: '#8b5cf6',
  tone: 'professional',
      examples: [
        "Help me structure my research paper",
        "Explain machine learning concepts",
        "Review my literature review",
        "Suggest research methodologies"
      ]
    },
    {
      id: 'project',
      label: 'Project Work',
      description: 'Business and project management',
      icon: 'briefcase',
      color: '#f59e0b',
  tone: 'work',
      examples: [
        "Help me plan my project timeline",
        "Create a project proposal outline",
        "Risk assessment strategies",
        "Team collaboration tips"
      ]
    },
    {
      id: 'creative',
      label: 'Creative Writing',
      description: 'Stories, poems, and creative content',
      icon: 'brush',
      color: '#ef4444',
  tone: 'funny',
      examples: [
        "Write a short story about time travel",
        "Create a poem about nature",
        "Help me develop a character",
        "Brainstorm plot ideas"
      ]
    },
    {
      id: 'custom',
      label: 'Custom',
      description: 'Set your own preferences',
      icon: 'settings',
      color: '#06b6d4',
      tone: 'casual',
      examples: [
        "Set your own tone and word limit",
        "Customize your chat experience",
        "Personalize AI responses"
      ]
    }
  ];

  const tones = [
    { id: 'casual', label: 'Casual', icon: 'happy', color: '#10b981' },
    { id: 'work', label: 'Work', icon: 'briefcase', color: '#3b82f6' },
    { id: 'funny', label: 'Funny', icon: 'happy', color: '#f59e0b' },
    { id: 'professional', label: 'Professional', icon: 'business', color: '#8b5cf6' }
  ];

  // removed wordLimits

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Load conversation if cid provided
  useEffect(() => {
    const cid = (params as any)?.cid as string | undefined;
    if (cid) {
      (async () => {
        try {
          const raw = await AsyncStorage.getItem('NOVABOT_CONVERSATIONS_V1');
          if (raw) {
            const list = JSON.parse(raw);
            const found = list.find((c: any) => c.id === cid);
            if (found) {
              setMessages(found.messages.map((m: any, i: number) => ({ id: `${Date.now()}-${i}`, role: m.role, content: m.content, timestamp: new Date(m.timestamp), mood: m.mood })));
            }
          }
        } catch {}
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistConversation = useCallback(async (msgs: Message[]) => {
    try {
      const raw = await AsyncStorage.getItem('NOVABOT_CONVERSATIONS_V1');
      const list = raw ? JSON.parse(raw) : [];
      const id = conversationId || Date.now().toString();
      const preview = msgs.find(m => m.role === 'user')?.content.slice(0, 80) || 'Conversation';
      // Strip attachment descriptor lines from persisted messages
      const cleanedMessages = msgs.map(m => ({
        role: m.role,
        content: m.content
          .split('\n')
          .filter(line => !line.startsWith('[Attachment:'))
          .join('\n')
          .trim(),
        timestamp: m.timestamp
      }));
      const record = {
        id,
        name: preview,
        created: msgs[0]?.timestamp || new Date(),
        updated: new Date(),
        messages: cleanedMessages,
        preview,
      };
      const idx = list.findIndex((c: any) => c.id === id);
      if (idx >= 0) list[idx] = record; else list.unshift(record);
      await AsyncStorage.setItem('NOVABOT_CONVERSATIONS_V1', JSON.stringify(list.slice(0, 100)));
    } catch {}
  }, [conversationId]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !selectedMood) {
      Alert.alert('Error', 'Please select a chat mood and enter a message');
      return;
    }

    let contentBase = inputText.trim();
    if (attachments.length) {
      const attachDesc = attachments.map(a => `[Attachment: ${a.name}${a.type?.startsWith('image') ? ' (image)' : ''}]`).join('\n');
      contentBase += `\n${attachDesc}`;
    }
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: contentBase,
      timestamp: new Date(),
  mood: selectedMood.label,
    };

  setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
  const currentBase = [...messages, userMessage];

    try {
      // Prepare the prompt with mood context
  const moodContext = `Chat Mood: ${selectedMood.label}
Tone: ${selectedMood.tone}
Context: ${selectedMood.description}

User Message: ${userMessage.content}

Please respond in the specified tone. Make the response engaging and helpful.`;

      const response = await chat([
        { role: 'system', content: moodContext },
        { role: 'user', content: userMessage.content }
      ], {
        provider: 'gemini',
        temperature: selectedMood.tone === 'funny' ? 0.8 : 0.7
      });

      // Backend returns { response: { content, error, ... }, ... }
      const replyContent = response?.response?.content ?? response?.content ?? response?.text;
      const replyError = response?.response?.error ?? response?.error;

      if (replyContent) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: replyContent,
          timestamp: new Date(),
          mood: selectedMood.label,
        };
        setMessages(prev => [...prev, assistantMessage]);
        persistConversation([...currentBase, assistantMessage]);
      } else if (replyError) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, I couldn't complete that request. ${String(replyError)}`,
          timestamp: new Date(),
          mood: selectedMood.label,
        };
        setMessages(prev => [...prev, assistantMessage]);
        persistConversation([...currentBase, assistantMessage]);
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to send message: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      setAttachments([]);
    }
  }, [inputText, selectedMood, attachments, messages, persistConversation]);

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          setMessages([]);
          setConversationName('');
          setAttachments([]);
        }}
      ]
    );
  };

  const handleMoodSelect = (mood: ChatMood) => {
    setSelectedMood(mood);
    setShowMoodExamples(false);
  };

  const shareConversation = async () => {
    if (messages.length === 0) {
      Alert.alert('Info', 'No conversation to share');
      return;
    }

    try {
      const conversationText = messages.map(msg => 
        `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`
      ).join('\n\n');

      await Share.share({
        message: `NovaBot Conversation:\n\n${conversationText}`,
        title: 'NovaBot Chat'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share conversation');
    }
  };

  const exportConversation = () => {
    if (messages.length === 0) {
      Alert.alert('Info', 'No conversation to export');
      return;
    }

    const conversationText = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`
    ).join('\n\n');

    // For now, just show an alert. In a real app, you'd save to file
    Alert.alert(
      'Export Conversation',
      'Conversation exported successfully! (Feature to be implemented)',
      [{ text: 'OK' }]
    );
  };

  const handleCopy = async (text: string) => {
    try {
      if (Platform.OS === 'web' && navigator?.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        await Clipboard.setStringAsync(text);
      }
      Alert.alert('Copied', 'Message copied to clipboard');
    } catch (e) {
      Alert.alert('Error', 'Failed to copy');
    }
  };

  // removed getWordCountColor helper

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ multiple: true });
      if ((res as any)?.type === 'success') {
        const entries = Array.isArray(res) ? res : [res];
        const mapped = await Promise.all(entries.map(async (f: any) => {
          let snippet = '';
            try {
              if (f?.uri && (f?.mimeType || '').startsWith('text/')) {
                snippet = await FileSystem.readAsStringAsync(f.uri, { encoding: FileSystem.EncodingType.UTF8 }).then(t=>t.slice(0,500));
              }
            } catch {}
          return { id: Date.now().toString()+Math.random(), uri: f.uri, name: f.name, type: f.mimeType || 'application/octet-stream', snippet };
        }));
        setAttachments(prev => [...prev, ...mapped]);
      }
    } catch (e) { Alert.alert('Error','File pick failed'); }
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') { Alert.alert('Permission','Media permission needed'); return; }
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: false });
      if (!res.canceled) {
        const mapped = (res.assets||[]).map((a: any) => ({ id: Date.now().toString()+Math.random(), uri: a.uri, name: a.fileName || 'image.jpg', type: a.type?`image/${a.type}`:'image', snippet:'' }));
        setAttachments(prev => [...prev, ...mapped]);
      }
    } catch (e) { Alert.alert('Error','Image pick failed'); }
  };

  return (
    <Layout 
      title="AI Chat Assistant" 
      subtitle="Choose your chat mood and start conversing with AI"
    >
      {/* Chat Mood Selection */}
      <View style={styles.moodSection}>
        <View style={styles.moodHeader}>
          <Text style={styles.sectionTitle}>Choose Chat Mood</Text>
          {selectedMood && (
            <Pressable 
              style={styles.examplesButton}
              onPress={() => setShowMoodExamples(!showMoodExamples)}
            >
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.examplesButtonText}>Examples</Text>
            </Pressable>
          )}
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
          {chatMoods.map((mood) => (
            <Pressable
              key={mood.id}
              style={[
                styles.moodCard,
                selectedMood?.id === mood.id && styles.selectedMoodCard
              ]}
              onPress={() => handleMoodSelect(mood)}
            >
              <View style={[styles.moodIcon, { backgroundColor: `${mood.color}20` }]}>
                <Ionicons name={mood.icon as any} size={24} color={mood.color} />
              </View>
              <Text style={styles.moodLabel}>{mood.label}</Text>
              <Text style={styles.moodDescription}>{mood.description}</Text>
              {/* word limit removed */}
            </Pressable>
          ))}
        </ScrollView>

        {/* Mood Examples */}
        {showMoodExamples && selectedMood && (
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>Example prompts for {selectedMood.label}:</Text>
            <View style={styles.examplesList}>
              {selectedMood.examples.map((example, index) => (
                <Pressable
                  key={index}
                  style={styles.exampleItem}
                  onPress={() => {
                    setInputText(example);
                    setShowMoodExamples(false);
                  }}
                >
                  <Text style={styles.exampleText}>{example}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Custom Tone Settings (word limit removed) */}
      {selectedMood?.id === 'custom' && (
        <View style={styles.customSettings}>
          <Text style={styles.sectionTitle}>Custom Tone</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Tone:</Text>
            <View style={styles.toneSelector}>
              {tones.map((tone) => (
                <Pressable
                  key={tone.id}
                  style={[
                    styles.toneButton,
                    selectedMood.tone === tone.id && styles.selectedToneButton
                  ]}
                  onPress={() => setSelectedMood({ ...selectedMood, tone: tone.id as any })}
                >
                  <Ionicons name={tone.icon as any} size={16} color={selectedMood.tone === tone.id ? '#ffffff' : tone.color} />
                  <Text style={[styles.toneButtonText, selectedMood.tone === tone.id && styles.selectedToneButtonText]}>
                    {tone.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Chat Interface */}
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <View style={styles.chatHeaderLeft}>
            <Text style={styles.chatTitle}>
              {selectedMood ? `Chatting in ${selectedMood.label} mode` : 'Select a chat mood to start'}
            </Text>
            {selectedMood && (
              <Text style={styles.chatSubtitle}>Tone: {selectedMood.tone}</Text>
            )}
          </View>
          
          {messages.length > 0 && (
            <View style={styles.chatActions}>
              {/* Removed share/export/clear buttons per request; keeping only markdown toggle */}
              <Pressable style={styles.actionButton} onPress={() => setMarkdownEnabled(m => !m)}>
                <Ionicons name={markdownEnabled ? 'code-slash' : 'text'} size={18} color="#8b5cf6" />
              </Pressable>
            </View>
          )}
        </View>

        {/* Chat Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyChat}>
              <View style={styles.emptyChatIcon}>
                <Ionicons name="chatbubbles" size={48} color="#64748b" />
              </View>
              <Text style={styles.emptyChatTitle}>
                {selectedMood ? `Ready to chat in ${selectedMood.label} mode!` : 'Select a chat mood to begin'}
              </Text>
              <Text style={styles.emptyChatSubtitle}>
                {selectedMood 
                  ? `I'll respond in a ${selectedMood.tone} tone.`
                  : 'Choose how you want to interact with me.'
                }
              </Text>
            </View>
          ) : (
            messages.map((message) => (
              <View key={message.id}>
                <ChatBubble
                  role={message.role}
                  content={message.content}
                  markdown={markdownEnabled}
                  onCopy={message.role === 'assistant' ? handleCopy : undefined}
                />
                {/* word count removed */}
              </View>
            ))
          )}
          
          {loading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingBubble}>
                <Text style={styles.loadingText}>AI is thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Message Input */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <View style={styles.attachmentRow}>
              {attachments.map(a => (
                <View key={a.id} style={styles.attachmentChip}>
                  <Ionicons name={a.type?.startsWith('image') ? 'image' : 'document'} size={14} color="#3b82f6" />
                  <Text style={styles.attachmentName} numberOfLines={1}>{a.name}</Text>
                  <Pressable onPress={() => setAttachments(prev => prev.filter(x => x.id !== a.id))}>
                    <Ionicons name="close" size={14} color="#64748b" />
                  </Pressable>
                </View>
              ))}
            </View>
            {/* Attachment preview temporarily disabled */}
            {attachments.length > 0 && false && (
              <View style={styles.attachmentPreviewPanel}>
                <ScrollView style={styles.attachmentPreviewScroll} nestedScrollEnabled>
                  {attachments.map(a => (
                    <View key={a.id} style={styles.attachmentPreviewItem}>
                      <View style={styles.attachmentPreviewHeader}>
                        <Ionicons name={a.type?.startsWith('image') ? 'image' : 'document'} size={16} color={a.type?.startsWith('image') ? '#8b5cf6' : '#3b82f6'} />
                        <Text style={styles.attachmentPreviewName} numberOfLines={1}>{a.name}</Text>
                        <Pressable onPress={() => setAttachments(prev => prev.filter(x => x.id !== a.id))} style={styles.previewRemoveBtn}>
                          <Ionicons name="close" size={14} color="#94a3b8" />
                        </Pressable>
                      </View>
                      {a.type?.startsWith('image') ? (
                        <Image source={{ uri: a.uri }} style={styles.previewImage} resizeMode="cover" />
                      ) : (
                        a.snippet ? (
                          <Text style={styles.previewText}>{a.snippet}</Text>
                        ) : (
                          <Text style={styles.previewTextEmpty}>No preview available</Text>
                        )
                      )}
                    </View>
                  ))}
                  <View style={{ height: 4 }} />
                </ScrollView>
                <Text style={styles.previewHint}>Attachments won't be stored in chat history. You can add more text below before sending.</Text>
              </View>
            )}
            <TextInput
              // Web: allow manual vertical resize via inline style injection (unsupported prop typed in RN)
              style={[
                styles.textInput,
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
                { height: Math.min(200, 40 + Math.ceil(inputText.length / 60) * 24) }
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={selectedMood ? `Type your message...` : 'Select a mood first'}
              placeholderTextColor="#94a3b8"
              multiline
              // no explicit maxLength now
              editable={!!selectedMood}
            />
            <View style={styles.inputActions}>
              <View style={styles.attachActions}>{/* Attachment buttons disabled */}</View>
              <Pressable
                style={[
                  styles.sendButton,
                  (!inputText.trim() || !selectedMood || loading) && styles.disabledSendButton
                ]}
                onPress={handleSendMessage}
                disabled={!inputText.trim() || !selectedMood || loading}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={(!inputText.trim() || !selectedMood || loading) ? "#64748b" : "#ffffff"} 
                />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  moodSection: {
    marginBottom: 24,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  examplesButton: {
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
  examplesButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  moodScroll: {
    marginBottom: 8,
  },
  moodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 160,
    alignItems: 'center',
  },
  selectedMoodCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  moodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  moodDescription: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 8,
  },
  examplesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  examplesList: {
    gap: 12,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  exampleText: {
    fontSize: 14,
    color: '#cbd5e1',
    flex: 1,
  },
  customSettings: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    width: 80,
  },
  toneSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  toneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  selectedToneButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  toneButtonText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  selectedToneButtonText: {
    color: '#ffffff',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatHeaderLeft: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  chatActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  clearButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyChatIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyChatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyChatSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  loadingBubble: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignSelf: 'flex-start',
    maxWidth: '75%',
  },
  loadingText: {
    fontSize: 16,
    color: '#10b981',
    fontStyle: 'italic',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
  },
  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  attachmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  attachmentName: {
    maxWidth: 120,
    fontSize: 12,
    color: '#cbd5e1',
  },
  attachActions: {
    flexDirection: 'row',
    gap: 10,
    marginRight: 12,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  textInput: {
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 6,
    marginBottom: 8,
    minHeight: 40,
    lineHeight: 22,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: '#64748b',
    opacity: 0.6,
  },
  attachmentPreviewPanel: {
    maxHeight: 200,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  attachmentPreviewScroll: {
    padding: 8,
  },
  attachmentPreviewItem: {
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 8,
  },
  attachmentPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  attachmentPreviewName: {
    flex: 1,
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: '500'
  },
  previewRemoveBtn: {
    padding: 4,
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#1e293b'
  },
  previewText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#cbd5e1',
    fontFamily: Platform.select({ web: 'monospace', default: undefined })
  },
  previewTextEmpty: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic'
  },
  previewHint: {
    fontSize: 11,
    color: '#94a3b8',
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
  attachBtnWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tooltip: {
    position: 'absolute',
    bottom: 46,
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 50,
  },
  tooltipText: {
    fontSize: 11,
    color: '#e2e8f0'
  }
});
