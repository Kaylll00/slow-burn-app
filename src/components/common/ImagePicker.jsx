import * as ImagePicker from 'expo-image-picker'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'


export default function WantImagePicker({ image, onImageSelected }) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri)
    }
  }

  return (
    <TouchableOpacity style={styles.container} onPress={pickImage}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.text}>Add photo</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { width: '100%', height: 200, borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  icon: { fontSize: 32, marginBottom: 8 },
  text: { color: '#999' },
})