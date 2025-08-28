import React, { useState, useRef, useEffect } from 'react';
import { 
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedList from '../../components/AnimatedList';
import { useAuth } from '../../context/AuthContext';
import { API_ROUTES } from '@/constants/config';
import { ChatBubble } from '../../components/ChatBubble';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatTab() {
  const { user, token } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
    const response = await fetch(`${API_ROUTES.chat}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ 
          message: input.trim(),
          user_id: user?.id || 'anonymous'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response 
        }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>
                Chat with NovaBot
              </Text>
              <Text style={styles.headerSubtitle}>
                Hi {user?.username}! Ask me anything.
              </Text>
            </View>
            {messages.length > 0 && (
              <Pressable 
                onPress={clearChat} 
                style={styles.clearButton}
              >
                <Ionicons name="refresh" size={20} color="#ffffff" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Chat Content */}
        {messages.length === 0 ? (
          <View style={styles.emptyChat}>
            <Ionicons 
              name="sparkles" 
              size={64} 
              color="rgba(255, 255, 255, 0.8)" 
              style={{ marginBottom: 24 }}
            />
            <Text style={styles.emptyChatTitle}>
              Start a conversation
            </Text>
            <Text style={styles.emptyChatSubtitle}>
              Try asking me about anything - I'm here to help!
            </Text>
            
            <View style={styles.suggestionsContainer}>
              {['Tell me a joke', 'Explain quantum physics', 'Plan my day'].map((prompt) => (
                <Pressable 
                  key={prompt}
                  onPress={() => setInput(prompt)}
                  style={styles.suggestionChip}
                >
                  <Text style={styles.suggestionText}>
                    {prompt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            style={{ flex: 1, paddingVertical: 8 }}
            data={messages}
            keyExtractor={(_: Message, i: number) => String(i)}
            renderItem={({ item }: { item: Message }) => (
              <ChatBubble 
                role={item.role === 'assistant' ? 'assistant' : 'user'} 
                content={item.content} 
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Typing Indicator */}
        {loading && (
          <View style={styles.typingContainer}>
            <View style={styles.typingDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <Text style={styles.typingText}>
              NovaBot is typing...
            </Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput 
              style={styles.input} 
              value={input} 
              onChangeText={setInput} 
              placeholder="Type your message..." 
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              multiline
              maxLength={1000}
            />
            <Pressable 
              onPress={send} 
              disabled={loading || !input.trim()}
              style={[
                styles.sendButton, 
                { 
                  opacity: loading || !input.trim() ? 0.5 : 1
                }
              ]}
            >
              <Ionicons 
                name={loading ? "hourglass" : "send"} 
                size={20} 
                color="white" 
              />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={{ padding: 12 }}>
        <AnimatedList />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 20,
    paddingVertical: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyChatTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#ffffff',
  },
  emptyChatSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  suggestionChip: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    paddingVertical: 4,
    color: '#ffffff',
  },
  sendButton: {
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
    backgroundColor: '#22c55e',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
