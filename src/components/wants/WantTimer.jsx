// src/components/wants/WantTimer.jsx
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

dayjs.extend(duration)

const WantTimer = ({ waitUntil }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs()
      const end = dayjs(waitUntil)
      const diff = end.diff(now)

      if (diff <= 0) {
        setIsUnlocked(true)
        setTimeLeft('Unlocked!')
        clearInterval(interval)
        return
      }

      const d = dayjs.duration(diff)
      const days = Math.floor(d.asDays())
      const hours = d.hours()
      const minutes = d.minutes()
      const seconds = d.seconds()

      setTimeLeft(
        days > 0
          ? `${days}d ${hours}h ${minutes}m remaining`
          : `${hours}h ${minutes}m ${seconds}s remaining`
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [waitUntil])

  return (
    <View style={[styles.container, isUnlocked && styles.unlocked]}>
      <Text style={styles.label}>
        {isUnlocked ? '🔓' : '⏳'} {timeLeft}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  unlocked: {
    backgroundColor: '#E8F5E9',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6F00',
  },
})

export default WantTimer