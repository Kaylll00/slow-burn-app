import * as Haptics from 'expo-haptics'




export const haptics = {
  // Light tap - for general button presses
  light: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  },

  // Medium tap - for important actions
  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  },

  // Heavy tap - for major actions
  heavy: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  },

  // Success - for cured/saved actions
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  },

  // Warning - for guilt modal
  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  },

  // Error - for failed actions
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  },
}