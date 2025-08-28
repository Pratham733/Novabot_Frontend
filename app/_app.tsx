import '../global.css';
// Ensure web polyfills and style conversions run as early as possible on web
import '../web-polyfills';
import { Platform, StyleSheet } from 'react-native';
import { createWebSafeStyles } from '@/utils/webSafeShadows';

if (Platform.OS === 'web') {
  // Wrap StyleSheet.create so any created styles are converted to web-safe styles
  const originalCreate = StyleSheet.create;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - we intentionally replace the function at runtime on web
  StyleSheet.create = (styles: any) => originalCreate(createWebSafeStyles(styles));
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children as any;
}
