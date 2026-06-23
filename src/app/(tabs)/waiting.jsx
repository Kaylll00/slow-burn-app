import { useEffect, useRef, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import ConfettiCannon from 'react-native-confetti-cannon'
import Toast from 'react-native-toast-message'
import WantCard from '../../components/wants/WantCard'
import { wantsService } from '../../services/wantsService'
import { useAuthStore } from '../../stores/authStore'
import { haptics } from '../../utils/haptics'

export default function WaitingScreen() {
  const { user } = useAuthStore()
  const [wants, setWants] = useState([])
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiRef = useRef(null)

  useEffect(() => {
    if (user?.id) {
      loadWants()
    }
  }, [user?.id])

  const loadWants = async () => {
    if (!user?.id) return

    setLoading(true)

    try {
      const data = await wantsService.getWantsByStatus(user.id, 'waiting')
      setWants(data)
    } catch (error) {
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Failed to load wants',
        text2: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCure = async (want) => {
    if (!user?.id) return

    try {
      await wantsService.markAsCured(want.id, user.id, want)

      setShowConfetti(true)
      haptics.success()

      Toast.show({
        type: 'success',
        text1: `+$${want.price} saved!`,
        text2: "You're amazing.",
      })

      loadWants()

      setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
    } catch (error) {
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Failed to cure item',
        text2: error.message,
      })
    }
  }

  const handleBuy = async (want) => {
    try {
      await wantsService.markAsBought(want.id, want)
      haptics.success()
      Toast.show({ type: 'success', text1: 'Marked as bought' })
      loadWants()
    } catch (error) {
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Failed to mark as bought',
        text2: error.message,
      })
    }
  }

  if (!user?.id) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Sign in to see your waiting list.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={wants}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadWants}
        contentContainerStyle={wants.length === 0 && styles.emptyList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No waiting wants yet.</Text>
        }
        renderItem={({ item }) => (
          <WantCard want={item} onCure={handleCure} onBuy={handleBuy} />
        )}
      />

      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 15,
  },
})
