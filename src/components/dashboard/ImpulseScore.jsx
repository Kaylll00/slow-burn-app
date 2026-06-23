import { StyleSheet, Text, View } from 'react-native'

export default function ImpulseScore({ score = 0 }) {
  const safeScore = Number.isFinite(score) ? score : 0

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Impulse Score</Text>
        <Text style={styles.score}>{safeScore}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(safeScore, 100)}%` }]} />
      </View>
      <Text style={styles.caption}>
        Lower is better. Keep waiting before buying.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  score: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF5722',
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#f1f1f1',
    overflow: 'hidden',
    marginBottom: 10,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FF5722',
  },
  caption: {
    fontSize: 13,
    color: '#666',
  },
})
