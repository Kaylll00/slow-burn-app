import { useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Toast from 'react-native-toast-message'

export default function ChangePasswordModal({ visible, onSave, onCancel }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (visible) {
      setNewPassword('')
      setConfirmPassword('')
      setShowNew(false)
      setShowConfirm(false)
    }
  }, [visible])

  const handleSave = async () => {
    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Password too short',
        text2: 'Must be at least 6 characters.',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: "Passwords don't match",
        text2: 'Please try again.',
      })
      return
    }

    setSaving(true)
    try {
      await onSave(newPassword)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Change Password</Text>

          <View style={styles.inputWrap}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password"
              secureTextEntry={!showNew}
              style={styles.input}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowNew((v) => !v)} style={styles.eyeButton}>
              <Text style={styles.eyeText}>{showNew ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              secureTextEntry={!showConfirm}
              style={styles.input}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowConfirm((v) => !v)} style={styles.eyeButton}>
              <Text style={styles.eyeText}>{showConfirm ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.cancelButton} disabled={saving}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable onPress={handleSave} style={styles.saveButton} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>Save</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: '#E5E5E5',
    borderRadius: 999,
    height: 4,
    marginBottom: 16,
    width: 48,
  },
  title: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputWrap: {
    marginBottom: 12,
    position: 'relative',
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderColor: '#F0F0F0',
    borderRadius: 12,
    borderWidth: 1,
    color: '#1A1A1A',
    height: 52,
    paddingHorizontal: 14,
    paddingRight: 72,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  eyeText: {
    color: '#FF5722',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
    paddingVertical: 14,
  },
  cancelText: {
    color: '#666666',
    fontWeight: '600',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#FF5722',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
})