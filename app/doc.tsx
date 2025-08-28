import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getDocument } from '@/lib/api';

export default function DocScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = idParam ? parseInt(idParam, 10) : undefined;
  const [doc, setDoc] = useState<any>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try { setDoc(await getDocument(id)); } finally { setLoading(false); }
    })();
  }, [id]);

  const exportPdf = async () => {
    if (!doc) return;
    try {
      if (Platform.OS === 'web') {
        // Simple fallback: open printable page
        const html = `<!doctype html><html><head><meta charset='utf-8'><title>${doc?.title || 'Document'}</title></head><body><h1>${doc?.title || ''}</h1><pre style="white-space:pre-wrap;font-family:Inter, system-ui, sans-serif;">${doc?.content || ''}</pre></body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        return;
      }
      const { default: RNHTMLtoPDF } = await import('react-native-html-to-pdf');
      const file = await RNHTMLtoPDF.convert({
        html: `<!doctype html><html><head><meta charset='utf-8'><style>body{font-family:-apple-system,system-ui,Roboto,Segoe UI; padding:16px;} h1{font-size:22px;} pre{white-space:pre-wrap;}</style></head><body><h1>${doc?.title || 'Document'}</h1><pre>${doc?.content || ''}</pre></body></html>`,
        fileName: (doc?.title || 'document').replace(/\W+/g, '-').toLowerCase(),
        base64: false,
      });
      try {
        const Sharing = await import('expo-sharing');
        if (Sharing && Sharing.isAvailableAsync && (await Sharing.isAvailableAsync())) {
          await Sharing.shareAsync(file.filePath || file.file, {} as any);
        } else {
          Alert.alert('Saved', `PDF saved at: ${file.filePath || file.file}`);
        }
      } catch {
        Alert.alert('Saved', `PDF saved at: ${file.filePath || file.file}`);
      }
    } catch (e: any) {
      Alert.alert('Export failed', e?.message || 'Could not export PDF');
    }
  };

  if (!id) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>No document selected</Text></View>;

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>{doc?.title || 'Document'}</Text>
      <Text style={{ color: '#6b7280', marginBottom: 16 }}>{doc?.doc_type}</Text>
      <Text style={{ fontSize: 16, lineHeight: 22 }}>{doc?.content}</Text>
      <Pressable style={{ marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: '#5B6CFF' }} onPress={exportPdf} disabled={loading}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>{loading ? 'Exporting…' : 'Export as PDF'}</Text>
      </Pressable>
    </ScrollView>
  );
}
