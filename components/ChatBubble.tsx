import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, ScrollView } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

// Parse markdown-ish content into blocks (text paragraphs and fenced code blocks)
function parseContent(raw: string) {
  const blocks: { type: 'text' | 'code'; content: string; lang?: string }[] = [];
  const fence = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0; let m: RegExpExecArray | null;
  while ((m = fence.exec(raw)) !== null) {
    if (m.index > lastIndex) {
      blocks.push({ type: 'text', content: raw.slice(lastIndex, m.index) });
    }
    blocks.push({ type: 'code', content: m[2].trimEnd(), lang: m[1] });
    lastIndex = fence.lastIndex;
  }
  if (lastIndex < raw.length) blocks.push({ type: 'text', content: raw.slice(lastIndex) });
  return blocks;
}

function renderInlineMarkdown(text: string) {
  const out: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let idx = 0; let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const start = match.index; const raw = match[0];
    if (start > idx) out.push(<Text key={out.length}>{text.slice(idx, start)}</Text>);
    if (raw.startsWith('**')) out.push(<Text key={out.length} style={styles.bold}>{raw.slice(2, -2)}</Text>);
    else if (raw.startsWith('*')) out.push(<Text key={out.length} style={styles.italic}>{raw.slice(1, -1)}</Text>);
    else if (raw.startsWith('`')) out.push(<Text key={out.length} style={styles.inlineCode}>{raw.slice(1, -1)}</Text>);
    idx = start + raw.length;
  }
  if (idx < text.length) out.push(<Text key={out.length}>{text.slice(idx)}</Text>);
  return out;
}

// Very lightweight syntax highlighting (no external deps) for common languages
function highlightCode(lang: string | undefined, code: string) {
  const l = (lang || '').toLowerCase();
  // Keyword sets
  const kwSets: Record<string, string[]> = {
    js: ['const','let','var','function','return','if','else','for','while','import','from','export','class','new','try','catch','finally','await','async','switch','case','break','continue'],
    ts: ['interface','type','implements','extends','public','private','protected','readonly','enum','namespace','declare', 'abstract', 'override'],
    py: ['def','return','if','elif','else','for','while','import','from','as','class','try','except','finally','with','yield','lambda','pass','break','continue','global','nonlocal','assert','raise'],
    java: ['class','public','private','protected','return','if','else','for','while','import','package','new','try','catch','finally','static','void','extends','implements','this','super'],
  };
  const keywords = new Set([...(kwSets.js), ...(kwSets.ts), ...(kwSets.py), ...(kwSets.java)]);
  // Comments & strings regex (very simplified)
  const tokens: React.ReactNode[] = [];
  const pattern = /(\/\/.*$|#.*$|"[^"\n]*"|'[^'\n]*'|`[^`\n]*`)/m; // first pass for comments/strings line by line
  const lines = code.split(/\n/);
  let globalIndex = 0;
  lines.forEach((line, i) => {
    // Highlight comments & strings
    const parts: React.ReactNode[] = [];
    let cursor = 0; let m: RegExpExecArray | null; const regex = /\/\/.*$|#.*$|"[^"\n]*"|'[^'\n]*'|`[^`\n]*`/g;
    while ((m = regex.exec(line)) !== null) {
      const start = m.index; const text = m[0];
      if (start > cursor) {
        parts.push(renderCodeWords(line.slice(cursor, start), keywords));
      }
      parts.push(<Text key={parts.length} style={styles.codeTokenString}>{text}</Text>);
      cursor = start + text.length;
    }
    if (cursor < line.length) parts.push(renderCodeWords(line.slice(cursor), keywords));
    tokens.push(<Text key={globalIndex++} style={styles.codeLine}>{parts}</Text>);
    if (i < lines.length - 1) tokens.push('\n');
  });
  return tokens;
}

function renderCodeWords(segment: string, keywords: Set<string>) {
  const out: React.ReactNode[] = [];
  const wordRegex = /[A-Za-z_][A-Za-z0-9_]*|[^A-Za-z_]+/g; let m: RegExpExecArray | null; let idx = 0;
  while ((m = wordRegex.exec(segment)) !== null) {
    const tok = m[0];
    if (/^[A-Za-z_]/.test(tok) && keywords.has(tok)) {
      out.push(<Text key={out.length} style={styles.codeTokenKeyword}>{tok}</Text>);
    } else {
      out.push(<Text key={out.length}>{tok}</Text>);
    }
    idx = m.index + tok.length;
  }
  return out;
}

export function ChatBubble({ role, content, markdown = true, onCopy }: { role: 'user' | 'assistant'; content: string; markdown?: boolean; onCopy?: (text: string) => void }) {
  const isUser = role === 'user';
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const blocks = useMemo(() => (markdown && !isUser ? parseContent(content) : [{ type: 'text', content }] as { type: 'text' | 'code'; content: string; lang?: string }[]), [content, markdown, isUser]);

  const handleCopyFull = () => onCopy?.(content);

  return (
    <View style={[
      styles.container, 
      isUser ? styles.userContainer : styles.assistantContainer
    ]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="sparkles" size={18} color="rgba(16, 185, 129, 0.8)" />
          </View>
        </View>
      )}
      
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble,
        { backgroundColor: isUser ? 'rgba(59,130,246,0.18)' : 'rgba(16,185,129,0.18)' }
      ]}>
        {role === 'assistant' && onCopy && (
          <Pressable style={styles.copyBtn} onPress={handleCopyFull}>
            <Ionicons name="copy" size={12} color="#fff" />
          </Pressable>
        )}
        {blocks.map((b, i) => {
          if (b.type === 'code') {
            return (
              <View key={i} style={styles.codeBlock}>
                <View style={styles.codeBlockHeader}>
                  <Text style={styles.codeLang}>{b.lang || 'code'}</Text>
                  {onCopy && (
                    <Pressable onPress={() => onCopy(b.content)} style={styles.codeCopyBtn}>
                      <Ionicons name="copy" size={14} color="#3b82f6" />
                      <Text style={styles.codeCopyText}>Copy</Text>
                    </Pressable>
                  )}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.codeScroll}>
                  <Text style={styles.codeText} selectable>{highlightCode(b.lang, b.content)}</Text>
                </ScrollView>
              </View>
            );
          }
          return (
            <Text key={i} style={[ styles.text, isUser ? styles.userText : styles.assistantText ]}>{renderInlineMarkdown(b.content)}</Text>
          );
        })}
      </View>

      {isUser && (
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, styles.userAvatar]}>
            <Ionicons name="person" size={18} color="rgba(255, 255, 255, 0.9)" />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginHorizontal: 12,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userAvatar: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userBubble: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderBottomRightRadius: 8,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  assistantBubble: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderBottomLeftRadius: 8,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  userText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  assistantText: {
    color: '#ffffff',
  },
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  inlineCode: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  copyBtn: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  copyBtnText: {
    fontSize: 10,
    color: '#fff',
    letterSpacing: 0.5,
  },
  codeBlock: {
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  codeBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)'
  },
  codeLang: {
    fontSize: 12,
    fontWeight: '600',
    color: '#93c5fd',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  codeCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59,130,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeCopyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6'
  },
  codeScroll: {
    maxHeight: 280,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  codeText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 13,
    lineHeight: 18,
    color: '#f1f5f9',
    minWidth: '100%'
  },
  codeLine: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  codeTokenKeyword: {
    color: '#93c5fd',
    fontWeight: '600'
  },
  codeTokenString: {
    color: '#fbbf24'
  }
});
