import { StyleSheet, Text, View } from 'react-native'

export default function CuredScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cured</Text>
      <Text style={styles.message}>Items you resisted will show up here.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  message: {
    color: '#666',
    fontSize: 15,
    textAlign: 'center',
  },
})
