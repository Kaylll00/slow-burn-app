import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import AnimatedCounter from '../../components/dashboard/AnimatedCounter'
import ImpulseScore from '../../components/dashboard/ImpulseScore'
import StatCard from '../../components/dashboard/StatCard'
import { savingsService } from '../../services/savingsService'
import { useAuthStore } from '../../stores/authStore'

const DashboardScreen = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalSaved: 0,
    weeklySaved: 0,
    savingsByCategory: {},
    impulseScore: 0,
  })

  useEffect(() => {
    if (user?.id) {
      loadStats()
    }
  }, [user?.id])

  const loadStats = async () => {
    const [totalSaved, weeklySaved, savingsByCategory] =
      await Promise.all([
        savingsService.getTotalSavings(user.id),
        savingsService.getWeeklySavings(user.id),
        savingsService.getSavingsByCategory(user.id),
      ])

    setStats({ totalSaved, weeklySaved, savingsByCategory })
  }

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.heading}>Your Savings 💰</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroEmoji}>💰</Text>
        <Text style={styles.heroLabel}>Total Saved</Text>
        <AnimatedCounter
          value={stats.totalSaved}
          duration={1500}
          style={styles.heroCounter}
        />
        <Text style={styles.heroSubtitle}>🔥 You're on fire!</Text>
      </View>

      <View style={styles.statRow}>
        <StatCard
          label="Saved This Week"
          value={`$${stats.weeklySaved.toFixed(2)}`}
          icon="📅"
        />
        <StatCard
          label="Impulse Score"
          value={`${stats.impulseScore}%`}
          icon="⚡"
        />
      </View>

      <ImpulseScore score={stats.impulseScore} />

      <Text style={styles.sectionTitle}>Saved By Category</Text>
      {Object.entries(stats.savingsByCategory).map(([cat, amount]) => (
        <View key={cat} style={styles.categoryRow}>
          <Text style={styles.categoryLabel}>{cat}</Text>
          <AnimatedCounter
            value={amount}
            duration={1200}
            style={styles.categoryAmount}
          />
        </View>
      ))}

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  heroCounter: {
    fontSize: 42,
    fontWeight: '800',
    color: '#4CAF50',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    color: '#1a1a1a',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#555',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
})

export default DashboardScreen
