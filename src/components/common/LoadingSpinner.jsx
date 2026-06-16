
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
export default function LoadingSpinner({message = 'Loading...'}) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF5722" />
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        marginTop: 12,
        color: '#666', 
        fontSize: 14,
    }
})