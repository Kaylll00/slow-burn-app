import dayjs from 'dayjs'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native'
import Toast from 'react-native-toast-message'
import ChangePasswordModal from '../../components/profile/ChangePasswordModal'
import CurrencyPicker from '../../components/profile/CurrencyPicker'
import EditProfileModal from '../../components/profile/EditProfileModal'
import JourneyStats from '../../components/profile/JourneyStats'
import ProfileHeader from '../../components/profile/ProfileHeader'
import SettingRow from '../../components/profile/SettingRow'
import SettingToggle from '../../components/profile/SettingToggle'
import { supabase } from '../../lib/supabase'
import * as profileService from '../../services/profileService'
import { useAuthStore } from '../../stores/authStore'
import * as haptics from '../../utils/haptics'

const storage = new MMKV()
const NOTIFICATIONS_KEY = 'notifications_enabled'
const LAST_EXPORT_KEY = 'last_export_date'

const COLORS = {
  primary: '#FF5722',
  danger: '#F44336',
  bg: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  secondary: '#666666',
  muted: '#999999',
  border: '#F0F0F0',
}

export default function ProfileScreen() {
  const router = useRouter()
  const { user, profile, setProfile, updateProfile: updateAuthProfile, clearAuth } = useAuthStore()

  const userId = user?.id ?? profile?.id ?? null

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [profileData, setProfileData] = useState(profile ?? null)
  const [stats, setStats] = useState(null)
  const [editVisible, setEditVisible] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [currencyVisible, setCurrencyVisible] = useState(false)
  const [supportVisible, setSupportVisible] = useState(false)
  const [aboutVisible, setAboutVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    storage.getBoolean(NOTIFICATIONS_KEY) ?? true
  )

  const memberSince = useMemo(() => {
    const sourceDate = profileData?.created_at || user?.created_at || new Date().toISOString()
    return dayjs(sourceDate).format('MMMM D, YYYY')
  }, [profileData?.created_at, user?.created_at])

  const loadProfile = useCallback(async () => {
    if (!userId) return

    try {
      setError('')
      const [loadedProfile, loadedStats] = await Promise.all([
        profileService.getProfile(userId),
        profileService.getJourneyStats(userId),
      ])

      setProfileData(loadedProfile)
      setStats(loadedStats)
      setProfile?.(loadedProfile)
      updateAuthProfile?.(loadedProfile)
    } catch (err) {
      const message = err?.message || 'Failed to load profile.'
      setError(message)
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: message,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [setProfile, updateAuthProfile, userId])

  useEffect(() => {
    if (!userId) {
      router.replace('/(auth)/login')
      return
    }

    loadProfile()
  }, [loadProfile, router, userId])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadProfile()
    Toast.show({
      type: 'success',
      text1: 'Profile refreshed',
      text2: '',
    })
  }

  const handleEditProfileSave = async (newUsername) => {
    try {
      const updated = await profileService.updateProfile(userId, { username: newUsername })
      setProfileData(updated)
      setProfile?.(updated)
      updateAuthProfile?.({ username: newUsername })
      haptics.success()
      Toast.show({
        type: 'success',
        text1: '✅ Profile updated',
        text2: 'Changes saved.',
      })
      setEditVisible(false)
    } catch (err) {
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: err?.message || 'Update failed.',
      })
    }
  }

  const handleChangePassword = async (newPassword) => {
    try {
      await profileService.changePassword(newPassword)
      haptics.success()
      Toast.show({
        type: 'success',
        text1: '🔒 Password updated',
        text2: 'Your new password is set.',
      })
      setPasswordVisible(false)
    } catch (err) {
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: err?.message || 'Password update failed.',
      })
    }
  }

  const handleCurrencySelect = async (currencyCode) => {
    if (currencyCode === (profileData?.currency || 'USD')) {
      setCurrencyVisible(false)
      return
    }

    try {
      haptics.light()
      const updated = await profileService.updateProfile(userId, { currency: currencyCode })
      setProfileData(updated)
      setProfile?.(updated)
      updateAuthProfile?.({ currency: currencyCode })
      Toast.show({
        type: 'success',
        text1: '💰 Currency updated',
        text2: `Now using ${currencyCode}`,
      })
      setCurrencyVisible(false)
    } catch (err) {
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: err?.message || 'Currency update failed.',
      })
    }
  }

  const handleNotificationsToggle = (value) => {
    haptics.light()
    setNotificationsEnabled(value)
    storage.set(NOTIFICATIONS_KEY, value)
    Toast.show({
      type: 'success',
      text1: value ? '🔔 Notifications enabled' : '🔕 Notifications disabled',
      text2: '',
    })
  }

  const handleExportData = async () => {
    try {
      haptics.success()
      await profileService.exportData(userId)
      storage.set(LAST_EXPORT_KEY, new Date().toISOString())
      Toast.show({
        type: 'success',
        text1: '📤 Data exported',
        text2: 'File ready to share.',
      })
    } catch (err) {
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Export failed',
        text2: err?.message || 'Please try again.',
      })
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      clearAuth?.()
      haptics.success()
      Toast.show({
        type: 'success',
        text1: '👋 Signed out',
        text2: 'See you next time!',
      })
      router.replace('/(auth)/login')
    } catch (err) {
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Sign out failed',
        text2: err?.message || 'Please try again.',
      })
    }
  }

  const handleSignOut = () => {
    haptics.warning()
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ])
  }

  const confirmDelete = async (textValue) => {
    if (textValue !== 'DELETE') {
      Toast.show({
        type: 'error',
        text1: 'Confirmation failed',
        text2: 'You must type DELETE exactly.',
      })
      return
    }

    try {
      haptics.error()
      await profileService.deleteAccount(userId)
      clearAuth?.()
      Toast.show({
        type: 'success',
        text1: 'Account deleted',
        text2: 'All data removed.',
      })
      router.replace('/(auth)/login')
    } catch (err) {
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Delete failed',
        text2: err?.message || 'Please try again.',
      })
    }
  }

  const handleDeleteAccount = () => {
    haptics.warning()

    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Delete Account',
        'This will permanently delete your account and all data. Type DELETE to confirm.',
        (text) => confirmDelete(text),
        'plain-text'
      )
      return
    }

    setDeleteText('')
    setDeleteModalVisible(true)
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    )
  }

  if (error && !profileData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Unable to load profile</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={loadProfile} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  const username = profileData?.username || user?.user_metadata?.username || 'User'
  const email = profileData?.email || user?.email || ''
  const avatarUrl = profileData?.avatar_url || null
  const currentCurrency = profileData?.currency || 'USD'

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>👤 Profile</Text>

        <ProfileHeader
          username={username}
          email={email}
          avatarUrl={avatarUrl}
          onEditPress={() => {
            haptics.light()
            setEditVisible(true)
          }}
        />

        <JourneyStats
          stats={stats}
          memberSince={memberSince}
          onAddFirstWant={() => router.push('/(tabs)/waiting')}
        />

        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeader}>Settings</Text>
        </View>

        <View style={styles.card}>
          <SettingRow
            icon="💰"
            label="Currency"
            value={currentCurrency}
            onPress={() => {
              haptics.light()
              setCurrencyVisible(true)
            }}
          />
          <SettingToggle
            icon="🔔"
            label="Notifications"
            value={notificationsEnabled}
            onToggle={handleNotificationsToggle}
          />
          <SettingRow
            icon="📤"
            label="Export Data"
            onPress={() => {
              haptics.light()
              handleExportData()
            }}
          />
          <SettingRow
            icon="🔒"
            label="Change Password"
            onPress={() => {
              haptics.light()
              setPasswordVisible(true)
            }}
          />
          <SettingRow
            icon="❓"
            label="Help & Support"
            onPress={() => {
              haptics.light()
              setSupportVisible(true)
            }}
          />
          <SettingRow
            icon="ℹ️"
            label="About"
            value="v1.0.0"
            onPress={() => {
              haptics.light()
              setAboutVisible(true)
            }}
            last
          />
        </View>

        <Pressable onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>🚪 Sign Out</Text>
        </Pressable>

        <Pressable onPress={handleDeleteAccount} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </Pressable>
      </ScrollView>

      <EditProfileModal
        visible={editVisible}
        currentUsername={username}
        onSave={handleEditProfileSave}
        onCancel={() => setEditVisible(false)}
      />

      <ChangePasswordModal
        visible={passwordVisible}
        onSave={handleChangePassword}
        onCancel={() => setPasswordVisible(false)}
      />

      <CurrencyPicker
        visible={currencyVisible}
        currentCurrency={currentCurrency}
        onSelect={handleCurrencySelect}
        onCancel={() => setCurrencyVisible(false)}
      />

      <Modal visible={supportVisible} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.infoSheet}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Help & Support</Text>
            <Text style={styles.modalBody}>Email support at support@slowburn.app for help.</Text>
            <Pressable onPress={() => setSupportVisible(false)} style={styles.modalAction}>
              <Text style={styles.modalActionText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={aboutVisible} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.infoSheet}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>About</Text>
            <Text style={styles.modalBody}>Slow Burn v1.0.0</Text>
            <Text style={styles.modalBody}>Built with Expo, Supabase, Zustand, and dayjs.</Text>
            <Pressable onPress={() => setAboutVisible(false)} style={styles.modalAction}>
              <Text style={styles.modalActionText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteModalVisible} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.deleteSheet}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalBody}>
              This will permanently delete your account and all your data. Type DELETE to confirm.
            </Text>

            <TextInput
              value={deleteText}
              onChangeText={setDeleteText}
              placeholder="DELETE"
              style={styles.input}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <View style={styles.actionsRow}>
              <Pressable onPress={() => setDeleteModalVisible(false)} style={styles.cancelAction}>
                <Text style={styles.cancelActionText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => confirmDelete(deleteText)} style={styles.deleteAction}>
                <Text style={styles.deleteActionText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.bg,
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionHeaderWrap: {
    marginBottom: 8,
    marginTop: 4,
  },
  sectionHeader: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  signOutButton: {
    alignItems: 'center',
    borderColor: COLORS.danger,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    padding: 16,
  },
  signOutText: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  deleteButton: {
    alignItems: 'center',
    padding: 12,
  },
  deleteText: {
    color: COLORS.danger,
    fontSize: 14,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: COLORS.secondary,
    marginTop: 12,
  },
  errorTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    color: COLORS.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  infoSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  deleteSheet: {
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
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalBody: {
    color: COLORS.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  modalAction: {
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    marginTop: 4,
    paddingVertical: 14,
  },
  modalActionText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.text,
    height: 52,
    marginBottom: 18,
    paddingHorizontal: 14,
  },
  actionsRow: {
    flexDirection: 'row',
  },
  cancelAction: {
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
    paddingVertical: 14,
  },
  cancelActionText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  deleteAction: {
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    flex: 1,
    paddingVertical: 14,
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
})