// src/utils/impulseCalculator.js
import dayjs from 'dayjs'

export const calculateImpulseScore = (wants) => {
  // wants = array of bought items this week
  if (!wants.length) return 0

  const boughtBeforeWait = wants.filter(want => {
    const decidedAt = dayjs(want.decided_at)
    const waitUntil = dayjs(want.wait_until)
    return decidedAt.isBefore(waitUntil)
  })

  return Math.round((boughtBeforeWait.length / wants.length) * 100)
}

export const getImpulseLabel = (score) => {
  if (score === 0) return { label: 'Iron Will 🧊', color: '#4CAF50' }
  if (score <= 25) return { label: 'Pretty Good 💪', color: '#8BC34A' }
  if (score <= 50) return { label: 'Slipping... 😅', color: '#FF9800' }
  if (score <= 75) return { label: 'Danger Zone 🚨', color: '#FF5722' }
  return { label: 'Impulse Monster 🔥', color: '#F44336' }
}