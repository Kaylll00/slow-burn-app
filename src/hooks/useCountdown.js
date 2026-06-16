import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

export const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  const [isUnlocked, setIsUnlocked] = useState(false)

  function calculateTimeLeft() {
    const now = dayjs()
    const target = dayjs(targetDate)
    const diff = target.diff(now)

    if (diff <= 0) return null

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const time = calculateTimeLeft()
      if (!time) {
        setIsUnlocked(true)
        clearInterval(interval)
      } else {
        setTimeLeft(time)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return { timeLeft, isUnlocked }
}