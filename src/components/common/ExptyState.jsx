import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function EmptyState({ emoji, title, message, actionLabel, onAction}){
    return(
        <View style = {styles.container}>
            <Text style = {styles.emoji}>{emoji}</Text>
            <Text style = {styles.title}>{title}</Text>
            <Text style = {styles.message}>{message}</Text>
            {actionLabel && (
                <TouchableOpacity style = {styles.button} onPress={onAction}>
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emoji: {fontSize: 64, marginBottom: 16},
    title: {fotnSize: 20, fontWeight: '700', marginBottom: 8, color: '#1a1a1a'},
    message: {fontSize: 14, color: '$666', textAlign: 'center', marginBottom: 24, lineHeight: 20},
    button: {backgroundColor: '#ffb722', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10},
    buttonText: {color: '#fff', fontWeight: 700},
})