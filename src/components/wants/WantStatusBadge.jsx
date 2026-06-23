import { StyleSheet, Text, View } from 'react-native'

const STATUS_STYLES = {
  waiting: {
    label: 'Waiting',
    backgroundColor: '#FFF3E0',
    color: '#FF6F00',
  },
  bought: {
    label: 'Bought',
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  cured: {
    label: 'Cured',
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
}

export default function WantStatusBadge({ status }) {
  const badge = STATUS_STYLES[status] || STATUS_STYLES.waiting

  return (
    <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
      <Text style={[styles.text, { color: badge.color }]}>{badge.label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
})
