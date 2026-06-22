
import { TextInput, View, StyleSheet } from 'react-native'



export default function SearchBar({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || '🔍 Search...'}
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
})