import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppText } from './src/components/ui/AppText';
import { PreparednessProvider } from './src/gamification/preparedness.context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { I18nProvider } from './src/i18n';
import { NotificationPolicyProvider } from './src/notifications/policy.context';
import { theme } from './src/theme/theme';

export default function App() {
  const [showStartupSplash, setShowStartupSplash] = useState(true);
  const [splashOpacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }).start(() => {
        setShowStartupSplash(false);
      });
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [splashOpacity]);

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <NotificationPolicyProvider>
          <PreparednessProvider>
            <StatusBar style="dark" />
            <View style={styles.appRoot}>
              <AppNavigator />
              {showStartupSplash ? (
                <Animated.View style={[styles.startupSplash, { opacity: splashOpacity }]}>
                  <View style={styles.startupSplashBadge}>
                    <View style={styles.startupIconWrap}>
                      <AppText variant="subtitle" style={styles.startupSplashEmoji}>
                        🛡️
                      </AppText>
                      <AppText variant="caption" style={styles.startupSplashIconAccent}>
                        ⚡
                      </AppText>
                    </View>
                    <AppText variant="title" style={styles.startupSplashTitle}>
                      Cro Emergency Tracker
                    </AppText>
                    <AppText variant="caption" muted style={styles.startupSplashSubtitle}>
                      Earthquake awareness and preparedness
                    </AppText>
                  </View>
                </Animated.View>
              ) : null}
            </View>
          </PreparednessProvider>
        </NotificationPolicyProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  startupSplash: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff4ec',
    paddingHorizontal: theme.spacing.xl,
  },
  startupSplashBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.card,
  },
  startupIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffe3d7',
    borderWidth: 1,
    borderColor: '#f4b79e',
    position: 'relative',
  },
  startupSplashEmoji: {
    fontSize: 30,
    textAlign: 'center',
  },
  startupSplashIconAccent: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    color: theme.colors.brand,
    fontWeight: theme.typography.fontWeightBold,
  },
  startupSplashTitle: {
    color: theme.colors.brand,
    textAlign: 'center',
  },
  startupSplashSubtitle: {
    textAlign: 'center',
  },
});
