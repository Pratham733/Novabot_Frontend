import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View as RNView, TextInput, Pressable, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { AuthContext } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { user, logout } = useContext<any>(AuthContext as any);
  // Use default light theme; dark/light toggle removed.
  const theme = Colors['light'];

  const [username, setUsername] = useState(user?.username ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUsername(user?.username ?? '');
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      // Attempt to PATCH /auth/me/ with new username
      await api.patch('/auth/me/', { username });
      // refresh local user
      const { data } = await api.get('/auth/me/');
      // best effort: update user via AuthContext if available
      // (AuthContext doesn't expose setUser publicly; consumer will refresh on next fetch)
  // Profile saved (log suppressed in production)
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
    setSaving(false);
  };

  // Password change feature disabled (backend endpoint not implemented)


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
  {/* App settings removed (theme toggling not needed) */}

      <View style={[styles.section, { backgroundColor: theme.card }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile Settings</Text>

        <Text style={[styles.inputLabel, { color: theme.text }]}>Username</Text>
        <TextInput style={[styles.input, { color: theme.text, backgroundColor: theme.background }]} value={username} onChangeText={setUsername} />
        <Pressable style={[styles.saveButton, { backgroundColor: theme.tint }]} onPress={saveProfile}>
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Username'}</Text>
        </Pressable>

  {/* Password change UI removed */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { borderRadius: 12, padding: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8 },
  rowText: { fontSize: 16 },
  rowAction: { fontSize: 14 },
  inputLabel: { marginTop: 8, marginBottom: 6, fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8 },
  saveButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  saveText: { color: 'white', fontWeight: '600' },
});
