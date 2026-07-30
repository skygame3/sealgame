import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

/** Temporary home screen while game features are implemented. */
export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('menu.title')}</Text>
      <Text style={styles.subtitle}>{t('menu.subtitle')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 12,
    textAlign: 'center',
  },
});
