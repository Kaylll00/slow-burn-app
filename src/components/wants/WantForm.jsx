// src/components/wants/WantForm.jsx
import { useState } from 'react'
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { scheduleUnlockNotification } from '../../services/notificationService'
import { wantsService } from '../../services/wantsService'
import { useAuthStore } from '../../stores/authStore'
import { haptics } from '../../utils/haptics'

const CATEGORIES = [
  'Tech',
  'Fashion',
  'Food',
  'Gaming',
  'Fitness',
  'Home',
  'Other',
]

const WAIT_PRESETS = [3, 7, 14, 30]

const WantForm = ({ onSuccess, onCancel, initialData = null }) => {
  const { user } = useAuthStore()
  const isEditing = !!initialData

  // Form state
  const [itemName, setItemName] = useState(initialData?.item_name || '')
  const [price, setPrice] = useState(initialData?.price?.toString() || '')
  const [category, setCategory] = useState(initialData?.category || 'Tech')
  const [reason, setReason] = useState(initialData?.reason_i_want_it || '')
  const [waitDays, setWaitDays] = useState(initialData?.wait_days || 7)
  const [customWait, setCustomWait] = useState('')
  const [loading, setLoading] = useState(false)

  // Validation
  const validate = () => {
    if (!itemName.trim()) {
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Item name required',
        text2: 'What are you trying to resist? 😅',
      })
      return false
    }

    if (!price || parseFloat(price) <= 0) {
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Valid price required',
        text2: 'How much would it cost you?',
      })
      return false
    }

    if (waitDays < 1 || waitDays > 365) {
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Wait period must be 1-365 days',
      })
      return false
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)

    try {
      const formData = {
        item_name: itemName.trim(),
        price: parseFloat(price),
        category,
        reason: reason.trim(),
        wait_days: waitDays,
      }

      let newWant

      if (isEditing) {
        // Update existing want
        newWant = await wantsService.updateWant(initialData.id, formData)
        haptics.success()
        Toast.show({
          type: 'success',
          text1: '✏️ Want updated!',
          text2: 'Changes saved successfully.',
        })
      } else {
        // Create new want
        newWant = await wantsService.addWant(user.id, formData)
        
        // Schedule notification for when it unlocks
        try {
          await scheduleUnlockNotification(newWant)
        } catch (err) {
          console.log('Notification scheduling failed:', err)
        }

        haptics.success()
        Toast.show({
          type: 'success',
          text1: '🔥 Added to your burn list!',
          text2: `Wait ${waitDays} days before deciding.`,
        })
      }

      // Call success callback
      if (onSuccess) onSuccess(newWant)
    } catch (error) {
      console.error('Submit error:', error)
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: error.message || 'Something went wrong.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle wait preset selection
  const handlePresetPress = (days) => {
    haptics.light()
    setWaitDays(days)
    setCustomWait('')
  }

  // Handle custom wait input
  const handleCustomWaitChange = (text) => {
    setCustomWait(text)
    const num = parseInt(text)
    if (!isNaN(num) && num > 0) {
      setWaitDays(num)
    }
  }

  // Handle category selection
  const handleCategoryPress = (cat) => {
    haptics.light()
    setCategory(cat)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? '✏️ Edit Want' : '🔥 What do you want?'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing ? 'Update your details' : 'Think carefully...'}
          </Text>
        </View>

        {/* Item Name */}
        <View style={styles.field}>
          <Text style={styles.label}>📦 Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. AirPods Pro 3"
            placeholderTextColor="#999"
            value={itemName}
            onChangeText={setItemName}
            maxLength={100}
          />
        </View>

        {/* Price + Category Row */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>💰 Price</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#999"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Category Pills */}
        <View style={styles.field}>
          <Text style={styles.label}>🏷 Category</Text>
          <View style={styles.pillsContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.pill,
                  category === cat && styles.pillActive,
                ]}
                onPress={() => handleCategoryPress(cat)}
              >
                <Text
                  style={[
                    styles.pillText,
                    category === cat && styles.pillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reason */}
        <View style={styles.field}>
          <Text style={styles.label}>💭 Why do you want it?</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="My old ones broke..."
            placeholderTextColor="#999"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{reason.length}/500</Text>
        </View>

        {/* Wait Period */}
        {!isEditing && (
          <View style={styles.field}>
            <Text style={styles.label}>⏳ How long will you wait?</Text>
            
            {/* Preset buttons */}
            <View style={styles.presetContainer}>
              {WAIT_PRESETS.map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.presetButton,
                    waitDays === days && !customWait && styles.presetButtonActive,
                  ]}
                  onPress={() => handlePresetPress(days)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      waitDays === days && !customWait && styles.presetTextActive,
                    ]}
                  >
                    {days}d
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom wait */}
            <View style={styles.customWaitRow}>
              <Text style={styles.customLabel}>Or custom:</Text>
              <TextInput
                style={styles.customInput}
                placeholder="14"
                placeholderTextColor="#999"
                value={customWait}
                onChangeText={handleCustomWaitChange}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={styles.customLabel}>days</Text>
            </View>
          </View>
        )}

        {/* Wait Period (Read-only when editing) */}
        {isEditing && (
          <View style={styles.field}>
            <Text style={styles.label}>⏳ Wait Period</Text>
            <View style={styles.lockedField}>
              <Text style={styles.lockedText}>
                {initialData.wait_days} days (cannot change)
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading
              ? '⏳ Saving...'
              : isEditing
              ? '💾 Save Changes'
              : '🔥 Start the Burn'}
          </Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              haptics.light()
              onCancel()
            }}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  field: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1a1a1a',
  },
  textarea: {
    minHeight: 100,
    paddingTop: 14,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  pillActive: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
  },
  pillText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#fff',
  },
  presetContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  presetButtonActive: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  presetTextActive: {
    color: '#fff',
  },
  customWaitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customLabel: {
    fontSize: 14,
    color: '#666',
  },
  customInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    width: 80,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  lockedField: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  lockedText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#FF5722',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
})

export default WantForm