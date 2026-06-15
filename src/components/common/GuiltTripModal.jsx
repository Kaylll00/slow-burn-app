// src/components/common/GuiltTripModal.jsx
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { getGuiltMessage } from '../../utils/guiltMessages'

const GuiltTripModal = ({ visible, want, impulseScore, onConfirm, onCancel }) => {
  if (!want) return null

  const message = getGuiltMessage(want.item_name, impulseScore)

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>

          <Text style={styles.emoji}>😬</Text>
          <Text style={styles.title}>Are you sure?</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.stats}>
            <Text style={styles.stat}>
              💸 You're spending: ${want.price?.toFixed(2)}
            </Text>
            {impulseScore > 0 && (
              <Text style={styles.stat}>
                ⚡ Impulse Score: {impulseScore}%
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={onConfirm}
          >
            <Text style={styles.confirmText}>
              Yes, I'm buying it anyway 💸
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelText}>
              No, I'll keep waiting 💪
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  message: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  stats: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
    gap: 4,
  },
  stat: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  confirmButton: {
    width: '100%',
    backgroundColor: '#FF5722',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  cancelButton: {
    width: '100%',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#4CAF50',
    fontWeight: '700',
    fontSize: 15,
  },
})

export default GuiltTripModal