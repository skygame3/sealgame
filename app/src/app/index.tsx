import { StyleSheet, Text, View } from 'react-native';

/** Temporary home screen while game features are implemented. */
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SEAL</Text>
      <Text style={styles.subtitle}>A strategy board game in development.</Text>
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
