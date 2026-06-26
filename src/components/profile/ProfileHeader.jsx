import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

export default function ProfileHeader({ username, email, avatarUrl, onEditPress }) {
  const initial = (username || email || '?').trim().charAt(0).toUpperCase()

  return (
    <View style={styles.card}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      )}

      <Text style={styles.username} numberOfLines={1}>
        {username || 'Your Profile'}
      </Text>
      <Text style={styles.email} numberOfLines={1}>
        {email || ''}
      </Text>

      <Pressable onPress={onEditPress} style={styles.button}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  avatar: {
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#FF5722',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  username: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  email: {
    color: '#666666',
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    borderColor: '#FF5722',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '600',
  },
})