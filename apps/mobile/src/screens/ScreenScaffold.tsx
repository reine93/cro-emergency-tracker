import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenScaffoldProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function ScreenScaffold({ title, subtitle, children }: ScreenScaffoldProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f8fb',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#122033',
  },
  subtitle: {
    color: '#4f5d75',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
});
