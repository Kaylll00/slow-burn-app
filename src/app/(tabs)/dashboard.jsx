// src/app/(tabs)/dashboard.jsx
import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import ImpulseScore from '../../components/dashboard/ImpulseScore'
import SavingsCounter from '../../components/dashboard/SavingsCounter'
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
    loadStats()
  }, [])

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

      {/* Big savings counter */}
      <SavingsCounter amount={stats.totalSaved} />

      {/* Stat cards */}
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

      {/* Impulse score breakdown */}
      <ImpulseScore score={stats.impulseScore} />

      {/* Category breakdown */}
      <Text style={styles.sectionTitle}>Saved By Category</Text>
      {Object.entries(stats.savingsByCategory).map(([cat, amount]) => (
        <View key={cat} style={styles.categoryRow}>
          <Text style={styles.categoryLabel}>{cat}</Text>
          <Text style={styles.categoryAmount}>${amount.toFixed(2)}</Text>
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