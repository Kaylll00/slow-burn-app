import { useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Toast from 'react-native-toast-message'

export default function EditProfileModal({ visible, currentUsername, onSave, onCancel }) {
  const [username, setUsername] = useState(currentUsername || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (visible) setUsername(currentUsername || '')
  }, [visible, currentUsername])

  const handleSave = async () => {
    const trimmed = username.trim()
    if (trimmed.length < 3) {
      Toast.show({
        type: 'error',
        text1: 'Username too short',
        text2: 'Must be at least 3 characters.',
      })
      return
    }

    setSaving(true)
    try {
      await onSave(trimmed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Edit Profile</Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />

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
  input: {
    backgroundColor: '#FAFAFA',
    borderColor: '#F0F0F0',
    borderRadius: 12,
    borderWidth: 1,
    color: '#1A1A1A',
    height: 52,
    marginBottom: 20,
    paddingHorizontal: 14,
  },
  actions: {
    flexDirection: 'row',
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