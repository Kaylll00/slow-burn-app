import { useEffect, useState } from 'react'
import { StyleSheet, Text } from 'react-native'

export default function AnimatedCounter({ 
  value, 
  duration = 1500, 
  prefix = '$',
  style 
}) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) {
      setDisplay(0)
      return
    }

    const steps = 60
    const stepValue = value / steps
    const stepTime = duration / steps
    let current = 0

    const interval = setInterval(() => {
      current += stepValue
      if (current >= value) {
        setDisplay(value)
        clearInterval(interval)
      } else {
        setDisplay(current)
      }
    }, stepTime)

    return () => clearInterval(interval)
  }, [value])

  return (
    <Text style={[styles.counter, style]}>
      {prefix}{display.toFixed(2)}
    </Text>
  )
}

const styles = StyleSheet.create({
  counter: {
    fontSize: 36,
    fontWeight: '800',
    color: '#4CAF50',
  },
})