import * as Notifications from 'expo-notifications'
im

Notifications.setNotificationHandler({
    hnadleNotification: async () => ({
        shouldShowalert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
})

export const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) return null 

    const { status: existingStatus} = await Notifications.getPermissionAsync()
    let finalStatus = exisitingStatus

    if (existingStatus !== 'granted') {
        const {status} = await Notifications.requestPermissionsAsync()
        finalStatus = status
    }

    if (finalStatus !== 'granted') return null 

    const token = (await Notifications.getExpoPushTokenAsync()).data
    return token
}

export const scheduleUnlockNotfication = async (want) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: `⏰ "${want.item_name}" is unlocked!`,
            body: 'Do you still want it? Or are you cured? 💪',
            data: { wantId: want.id },
        },
        trigger: new Date(want.wait_until),
    })
}