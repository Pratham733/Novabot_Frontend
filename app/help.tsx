import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function HelpPage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Help & Support</Text>
      <Text style={{ color: theme.muted }}>For support please contact support@novabot.local or visit our docs.</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 } });
