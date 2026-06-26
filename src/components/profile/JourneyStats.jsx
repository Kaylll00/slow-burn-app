import { Pressable, StyleSheet, Text, View } from 'react-native'

function StatItem({ label, value }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}

export default function JourneyStats({ stats, memberSince, onAddFirstWant }) {
  if (!stats || stats.totalLogged === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>🏆 Your Journey</Text>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Start your journey by adding your first want!</Text>
          {onAddFirstWant ? (
            <Pressable onPress={onAddFirstWant} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Go to Waiting</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🏆 Your Journey</Text>

      <View style={styles.grid}>
        <StatItem label="📅 Member since" value={memberSince} />
        <StatItem label="📦 Total logged" value={stats.totalLogged} />
        <StatItem label="⏳ Waiting" value={stats.waiting} />
        <StatItem label="✅ Cured" value={stats.cured} />
        <StatItem label="🛒 Bought" value={stats.bought} />
        <StatItem label="💰 Total saved" value={`$${stats.totalSaved}`} />
        <StatItem label="⚡ Avg impulse" value={`${stats.avgImpulse}%`} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  title: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: '#FAFAFA',
    borderColor: '#F0F0F0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
    width: '48%',
  },
  statLabel: {
    color: '#999999',
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderColor: '#F0F0F0',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  emptyText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
})