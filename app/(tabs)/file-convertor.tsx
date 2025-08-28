import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';
import { convertDocumentFile } from '@/lib/api';

export default function FileConvertor() {
  const theme = Colors['light'];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [msg, setMsg] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('txt');
  const [supportedFormats, setSupportedFormats] = useState<string[]>([]);

  const supported = ['txt', 'json', 'pdf', 'docx', 'pptx'];

  const onChoose = () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    }
  };

  const onConvert = async () => {
    if (Platform.OS !== 'web') { setMsg('File convertor currently supports web only'); return; }
    const inp = fileInputRef.current;
    if (!inp || !inp.files || inp.files.length === 0) { setMsg('No file selected'); return; }
    const f = inp.files[0];
    setLoading(true); setMsg(undefined);
    try {
      const resp = await convertDocumentFile(f as any, targetFormat);
      // If server returned 501 or other non-2xx, show server message
      if (resp.status && resp.status >= 400) {
        const err = resp.data?.error || resp.data || `Server responded ${resp.status}`;
        setMsg(String(err));
      } else {
        const data = resp.data;
        // If server returned arraybuffer/binary
        if (data && data instanceof ArrayBuffer) {
          const blob = new Blob([data], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${f.name.split('.').slice(0, -1).join('.') || 'converted'}.${targetFormat}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          setMsg('Download started');
        } else if (data && typeof data === 'object' && data.content) {
          const blob = new Blob([String(data.content)], { type: targetFormat === 'json' ? 'application/json' : 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${f.name.split('.').slice(0, -1).join('.') || 'converted'}.${targetFormat}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          setMsg('Download started');
        } else if (typeof data === 'string') {
          const blob = new Blob([data], { type: targetFormat === 'json' ? 'application/json' : 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${f.name.split('.').slice(0, -1).join('.') || 'converted'}.${targetFormat}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          setMsg('Download started');
        } else {
          setMsg('Conversion completed — server returned unexpected payload');
        }
      }
    } catch (e: any) {
      setMsg('Conversion failed: ' + (e?.message || e));
    } finally { setLoading(false); }
  };

  React.useEffect(() => {
    // fetch server capabilities
    (async () => {
      try {
        // @ts-ignore
        const api = await import('@/lib/api');
        const caps = await api.convertCapabilities();
        if (caps?.formats) setSupportedFormats(caps.formats);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background } as any]}>
      <View style={[styles.card, { backgroundColor: theme.card } as any]}>
        <Text style={[styles.title, { color: theme.text }]}>File Convertor</Text>
        <Text style={{ color: theme.muted, marginBottom: 8 }}>Upload a file and choose the target format.</Text>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Pressable style={[styles.btn, styles.ghost]} onPress={onChoose}>
            <Text style={{ color: theme.text }}>{selectedFileName ? `File: ${selectedFileName}` : 'Choose file'}</Text>
          </Pressable>

          <Pressable style={[styles.btn, styles.primary]} onPress={onConvert} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: 'white' }}>Convert</Text>}
          </Pressable>
        </View>

        <View style={{ marginTop: 12, flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {supportedFormats.length === 0 ? supported.map(fmt => (
            <Pressable key={fmt} style={[styles.chip, targetFormat === fmt ? styles.primary : {}]} onPress={() => setTargetFormat(fmt)}>
              <Text style={{ color: targetFormat === fmt ? 'white' : theme.text }}>{fmt.toUpperCase()}</Text>
            </Pressable>
          )) : supportedFormats.map(fmt => (
            <Pressable key={fmt} style={[styles.chip, targetFormat === fmt ? styles.primary : {}]} onPress={() => setTargetFormat(fmt)}>
              <Text style={{ color: targetFormat === fmt ? 'white' : theme.text }}>{fmt.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        {Platform.OS === 'web' ? (
          // @ts-ignore
          <input ref={fileInputRef as any} type="file" style={{ display: 'none' }} onChange={(e: any) => { const f = e.target.files && e.target.files[0]; if (f) setSelectedFileName(f.name); }} />
        ) : null}

        {msg ? <Text style={{ color: theme.muted, marginTop: 10 }}>{msg}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 900, backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' as any },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  primary: { backgroundColor: '#6D28D9' },
  ghost: { backgroundColor: '#F3F4F6' },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
});
