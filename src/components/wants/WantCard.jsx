// src/components/wants/WantCard.jsx
import dayjs from 'dayjs'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import WantStatusBadge from './WantStatusBadge'
import WantTimer from './WantTimer'

const WantCard = ({ want, onPress, onBuy, onCure }) => {
  const isUnlocked = dayjs().isAfter(dayjs(want.wait_until))
  const isWaiting = want.status === 'waiting'

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.itemName}>{want.item_name}</Text>
        <WantStatusBadge status={want.status} />
      </View>

      {/* Price + Category */}
      <View style={styles.meta}>
        <Text style={styles.price}>${want.price.toFixed(2)}</Text>
        <Text style={styles.category}>{want.category}</Text>
      </View>

      {/* Reason */}
      {want.reason_i_want_it && (
        <Text style={styles.reason}>"{want.reason_i_want_it}"</Text>
      )}

      {/* Timer — only show if waiting */}
      {isWaiting && (
        <WantTimer waitUntil={want.wait_until} />
      )}

      {/* Action Buttons */}
      {isWaiting && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.buyButton,
              !isUnlocked && styles.buyButtonLocked
            ]}
            onPress={() => onBuy(want)}
          >
            <Text style={styles.buyText}>
              {isUnlocked ? '🛒 I Bought It' : '🔒 Still Waiting...'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cureButton}
            onPress={() => onCure(want)}
          >
            <Text style={styles.cureText}>✅ I'm Cured</Text>
          </TouchableOpacity>
        </View>
      )}

    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF5722',
  },
  category: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reason: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buyButtonLocked: {
    backgroundColor: '#ccc',
  },
  buyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  cureButton: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cureText: {
    color: '#4CAF50',
    fontWeight: '700',
    fontSize: 13,
  },
})

export default WantCard
