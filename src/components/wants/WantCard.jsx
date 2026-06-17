import dayjs from 'dayjs'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useCountdown } from '../../hooks/useCountdown'; // Import the hook


const WantCard = ({ want, onPress, onBuy, onCure }) => {
  // 👇 PUT IT HERE - inside the component, before the return
  const { timeLeft, isUnlocked } = useCountdown(want.wait_until)
  
  // Calculate percentage for progress bar
  const totalWait = dayjs(want.wait_until).diff(dayjs(want.created_at))
  const elapsed = dayjs().diff(dayjs(want.created_at))
  const percentage = Math.min(100, Math.round((elapsed / totalWait) * 100))

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      
      {/* Header with name and status */}
      <View style={styles.header}>
        <Text style={styles.itemName}>{want.item_name}</Text>
        <View style={[
          styles.statusBadge, 
          isUnlocked ? styles.unlockedBadge : styles.waitingBadge
        ]}>
          <Text style={styles.statusText}>
            {isUnlocked ? '🟢 Unlocked' : '🟡 Waiting'}
          </Text>
        </View>
      </View>

      {/* Price and category */}
      <View style={styles.meta}>
        <Text style={styles.price}>${want.price.toFixed(2)}</Text>
        <Text style={styles.category}>{want.category}</Text>
      </View>

      {/* The Countdown Section - REPLACE your old timer with this */}
      <View style={[
        styles.timerContainer,
        isUnlocked && styles.unlockedContainer
      ]}>
        
        {/* Progress Bar */}
        <View style={styles.progressBackground}>
          <View style={[
            styles.progressFill,
            { width: `${percentage}%` },
            isUnlocked && styles.progressFillComplete
          ]} />
        </View>

        {/* 👇 THIS IS WHERE THE SNIPPET GOES IN THE JSX */}
        <Text style={[
          styles.timerText,
          isUnlocked && styles.unlockedText
        ]}>
          {isUnlocked 
            ? '🔓 Unlocked! Decide now.' 
            : `${timeLeft?.days || 0}d ${timeLeft?.hours || 0}h ${timeLeft?.minutes || 0}m ${timeLeft?.seconds || 0}s remaining`
          }
        </Text>
        
        {!isUnlocked && (
          <Text style={styles.percentageText}>{percentage}% complete</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.buyButton,
            !isUnlocked && styles.buyButtonLocked
          ]}
          onPress={() => onBuy(want)}
          disabled={!isUnlocked}  // Disable if still locked
        >
          <Text style={styles.buyText}>
            {isUnlocked ? '🛒 Buy It' : '🔒 Locked'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cureButton}
          onPress={() => onCure(want)}
        >
          <Text style={styles.cureText}>✅ I'm Cured</Text>
        </TouchableOpacity>
      </View>

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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  waitingBadge: {
    backgroundColor: '#FFF3E0',
  },
  unlockedBadge: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
  timerContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  unlockedContainer: {
    backgroundColor: '#E8F5E9',
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF5722',
    borderRadius: 3,
  },
  progressFillComplete: {
    backgroundColor: '#4CAF50',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6F00',
    textAlign: 'center',
  },
  unlockedText: {
    color: '#2E7D32',
  },
  percentageText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buyButtonLocked: {
    backgroundColor: '#CCCCCC',
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