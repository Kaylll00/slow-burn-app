# Phase 13 — Profile & Settings Screen

## Overview

Build a complete Profile & Settings screen for the Slow Burn app. This screen shows the user's profile info, journey stats, and app settings. It is accessible from the main tab bar.

---

## Tech Stack (MUST follow these)

- React Native with Expo
- Expo Router for navigation
- Supabase for database and authentication
- Zustand for state management
- react-native-toast-message for toasts
- expo-haptics for haptic feedback
- dayjs for date formatting
- MMKV for local storage (react-native-mmkv)
- expo-file-system for file operations
- expo-sharing for sharing exported files

---

## Required Package Installations

```bash
npx expo install expo-file-system expo-sharing
```

All other packages should already be installed from previous phases.

---

## Screen Location

File path: `src/app/(tabs)/profile.jsx`

This screen is part of the bottom tab bar navigation alongside:
- ⏳ Waiting
- ✅ Cured
- 🛒 Bought
- 📊 Stats
- 👤 Profile (this screen)

---

## Tab Bar Update

Update `src/app/(tabs)/_layout.jsx` to include the Profile tab:

```jsx
<Tabs.Screen
  name="profile"
  options={{
    title: 'Profile',
    tabBarLabel: '👤 Profile',
    tabBarIcon: ({ color, size }) => (
      <Text style={{ fontSize: size }}>👤</Text>
    ),
  }}
/>
```

---

## File Structure to Create

```
src/
├── app/(tabs)/
│   └── profile.jsx              ← Main profile screen
│
├── components/profile/
│   ├── ProfileHeader.jsx        ← Avatar + name + email
│   ├── JourneyStats.jsx         ← Stats grid card
│   ├── SettingRow.jsx           ← Reusable setting row component
│   ├── SettingToggle.jsx        ← Toggle version of setting row
│   ├── EditProfileModal.jsx     ← Edit username modal
│   ├── ChangePasswordModal.jsx  ← Change password modal
│   └── CurrencyPicker.jsx       ← Currency dropdown/picker
│
├── services/
│   └── profileService.js        ← Profile CRUD + stats + export
│
└── utils/
    └── haptics.js               ← Already exists, reuse it
```

---

## Data Sources

### User Profile Data (from Supabase)
- Username
- Email
- Avatar URL
- Currency preference
- Account creation date

### Journey Stats (calculated from Supabase queries)
- Total items logged (all wants ever created)
- Items cured (status = 'cured')
- Items bought (status = 'bought')
- Items currently waiting (status = 'waiting')
- Total money saved (sum of cured items' prices)
- Average impulse score (average of bought items' impulse_score)

### Settings (stored in Supabase profiles table + local MMKV)
- Currency preference (stored in Supabase)
- Notifications toggle (stored in MMKV locally)

---

## Service File Implementation

Create: `src/services/profileService.js`

This file should contain these functions:

### getProfile(userId)
Returns the user's profile from Supabase.
```js
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

### updateProfile(userId, updates)
Updates username, currency, or avatar.
```js
const { data } = await supabase
  .from('profiles')
  .update(updates)
  .eq('id', userId)
  .select()
  .single()
```

### getJourneyStats(userId)
Calculates and returns all journey stats:
```js
// Total items logged
const { count: totalItems } = await supabase
  .from('wants')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)

// Items by status
const { count: curedCount } = await supabase
  .from('wants')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('status', 'cured')

const { count: boughtCount } = await supabase
  .from('wants')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('status', 'bought')

const { count: waitingCount } = await supabase
  .from('wants')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('status', 'waiting')

// Total saved
const { data: curedItems } = await supabase
  .from('wants')
  .select('price')
  .eq('user_id', userId)
  .eq('status', 'cured')

const totalSaved = curedItems.reduce((sum, item) => sum + item.price, 0)

// Average impulse score
const { data: boughtItems } = await supabase
  .from('wants')
  .select('impulse_score')
  .eq('user_id', userId)
  .eq('status', 'bought')
  .not('impulse_score', 'is', null)

const avgImpulse = boughtItems.length > 0
  ? Math.round(boughtItems.reduce((sum, item) => sum + item.impulse_score, 0) / boughtItems.length)
  : 0

return {
  totalLogged: totalItems,
  waiting: waitingCount,
  cured: curedCount,
  bought: boughtCount,
  totalSaved,
  avgImpulse,
}
```

### exportData(userId)
Exports all user data as JSON file:
```js
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

const exportData = async (userId) => {
  const { data } = await supabase
    .from('wants')
    .select('item_name, price, category, reason_i_want_it, status, wait_days, impulse_score, created_at, decided_at')
    .eq('user_id', userId)

  const jsonString = JSON.stringify(data, null, 2)
  const fileUri = FileSystem.documentDirectory + 'slow-burn-export.json'

  await FileSystem.writeAsStringAsync(fileUri, jsonString)
  await Sharing.shareAsync(fileUri)
}
```

### changePassword(newPassword)
Updates user password via Supabase auth:
```js
const { error } = await supabase.auth.updateUser({ password: newPassword })
if (error) throw error
```

### deleteAccount(userId)
Deletes user account and all associated data:
```js
// Delete savings_log
await supabase.from('savings_log').delete().eq('user_id', userId)

// Delete wants
await supabase.from('wants').delete().eq('user_id', userId)

// Delete profile
await supabase.from('profiles').delete().eq('id', userId)

// Sign out (auth deletion requires admin or RPC)
await supabase.auth.signOut()
```

---

## Screen Layout (Top to Bottom)

### 1. Header
- Title: "👤 Profile"
- No back button (it's a tab)

### 2. Profile Card
- Circular avatar placeholder (80px)
  - Show first letter of username if no avatar
  - Orange background (#FF5722) with white text
- Username displayed below avatar (20px bold)
- Email displayed below username (14px gray)
- "Edit Profile" button (small outlined button)
  - On tap: opens edit profile modal

### 3. Journey Stats Card
- White card with rounded corners and shadow
- Title: "🏆 Your Journey"
- Stats displayed in a 2-column grid layout:
  - 📅 Member since: [formatted date with dayjs]
  - 📦 Total logged: [number]
  - ⏳ Waiting: [number]
  - ✅ Cured: [number]
  - 🛒 Bought: [number]
  - 💰 Total saved: $[amount]
  - ⚡ Avg impulse: [number]%

### 4. Settings Section
- Section title: "Settings"
- List of setting rows in a white card

#### Setting Rows:

**Row 1: Currency**
- Icon: 💰
- Label: "Currency"
- Right side: current currency code with dropdown indicator
- Options: USD, EUR, GBP, PHP, JPY, KRW, CAD, AUD, INR
- On tap: opens currency picker
- On change: update Supabase profile + show toast

**Row 2: Notifications**
- Icon: 🔔
- Label: "Notifications"
- Right side: toggle switch
- On toggle: save to MMKV storage locally
- Show toast: "Notifications enabled" or "Notifications disabled"

**Row 3: Export Data**
- Icon: 📤
- Label: "Export Data"
- Right side: arrow icon →
- On tap: export all user wants as JSON
- Use expo-file-system and expo-sharing
- Show toast: "Data exported successfully"

**Row 4: Change Password**
- Icon: 🔒
- Label: "Change Password"
- Right side: arrow icon →
- On tap: opens change password modal

**Row 5: Help & Support**
- Icon: ❓
- Label: "Help & Support"
- Right side: arrow icon →
- On tap: opens a simple info modal with email contact

**Row 6: About**
- Icon: ℹ️
- Label: "About"
- Right side: "v1.0.0"
- On tap: shows app version and credits in small modal

### 5. Sign Out Button
- Full width button at bottom
- Red outline style (border only, not filled)
- Text: "🚪 Sign Out"
- On tap:
  1. Show confirmation alert: "Are you sure you want to sign out?"
  2. If confirmed:
     - Call `supabase.auth.signOut()`
     - Clear Zustand auth store
     - Navigate to login: `router.replace('/(auth)/login')`
     - Show toast: "Signed out successfully"
  3. Haptic: `haptics.warning()` on tap, `haptics.success()` on success

### 6. Delete Account Button
- Below sign out button
- Text only style (red text, no background, no border)
- Text: "Delete Account"
- On tap:
  1. Show confirmation alert: "This will permanently delete your account and all your data. This cannot be undone."
  2. Require user to type "DELETE" to confirm
  3. If confirmed:
     - Call profileService.deleteAccount(userId)
     - Navigate to login screen
     - Show toast: "Account deleted"
  4. Haptic: `haptics.error()` on confirm

---

## Edit Profile Modal

A modal that allows the user to edit their username.

### Layout:
- Modal with animationType="slide" and presentationStyle="pageSheet"
- Drag handle at top
- Title: "Edit Profile"
- Username input field (pre-filled with current username)
- Save button (orange filled)
- Cancel button (gray text)

### On Save:
- Validate username is not empty (min 3 chars)
- Update Supabase profile via profileService.updateProfile
- Update local Zustand store
- Show toast: "✅ Profile updated"
- Close modal
- Haptic: `haptics.success()`

### On Error:
- Show toast with error message
- Haptic: `haptics.error()`

---

## Change Password Modal

A modal for changing user password.

### Layout:
- Modal with animationType="slide" and presentationStyle="pageSheet"
- Title: "Change Password"
- New password input (with show/hide toggle)
- Confirm password input (with show/hide toggle)
- Save button
- Cancel button

### Validation:
- New password must be at least 6 characters
- Both passwords must match
- Show specific error toast for each validation failure

### On Save:
- Call profileService.changePassword(newPassword)
- Show toast: "🔒 Password updated successfully"
- Close modal
- Haptic: `haptics.success()`

### On Error:
- Show toast with error message
- Haptic: `haptics.error()`

---

## Currency Picker

A modal or action sheet showing all available currencies.

### Layout:
- Modal with list of currencies
- Each row shows: currency symbol + code + name
  - Example: "$ USD - US Dollar"
- Active currency has checkmark on right
- On tap: selects currency and closes modal

### Available Currencies:
- USD ($) - US Dollar
- EUR (€) - Euro
- GBP (£) - British Pound
- PHP (₱) - Philippine Peso
- JPY (¥) - Japanese Yen
- KRW (₩) - Korean Won
- CAD (C$) - Canadian Dollar
- AUD (A$) - Australian Dollar
- INR (₹) - Indian Rupee

### On Select:
- Update Supabase profile with new currency
- Update Zustand store
- Show toast: "💰 Currency updated to [CODE]"
- Haptic: `haptics.light()`

---

## Styling

### Color Palette
- Primary: #FF5722
- Success Green: #4CAF50
- Danger Red: #F44336
- Warning Orange: #FF9800
- Background: #FAFAFA
- Card Background: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #666666
- Text Muted: #999999
- Border: #F0F0F0
- Toggle Active: #FF5722
- Toggle Inactive: #CCCCCC

### Card Styling
- Background: white
- Border radius: 16px
- Padding: 16px
- Margin bottom: 16px
- Shadow:
  - shadowColor: '#000'
  - shadowOffset: { width: 0, height: 2 }
  - shadowOpacity: 0.08
  - shadowRadius: 8
  - elevation: 3

### Setting Row Styling
- Height: 52px
- Padding horizontal: 16px
- Border bottom: 1px solid #F0F0F0
- Flex direction: row
- Justify content: space-between
- Align items: center
- Last row should not have border bottom

### Button Styling
- Sign out button:
  - Border: 1px solid #F44336
  - Border radius: 12px
  - Padding: 16px
  - Background: transparent
  - Text color: #F44336
  - Font weight: 700
- Delete account button:
  - No border
  - No background
  - Text color: #F44336
  - Font size: 14px
  - Padding: 12px
- Edit profile button:
  - Border: 1px solid #FF5722
  - Border radius: 8px
  - Padding: 8px 16px
  - Background: transparent
  - Text color: #FF5722
  - Font weight: 600

### Avatar Placeholder
- Width and height: 80px
- Border radius: 40px (circle)
- Background: #FF5722
- Text: first letter of username (uppercase)
- Text color: white
- Font size: 32px
- Font weight: bold
- Centered text

### Typography
- Screen title: 26px bold
- Card title: 18px bold
- Username: 20px bold
- Email: 14px regular, color #666
- Setting label: 15px medium
- Setting value: 14px regular, color #666
- Stat label: 12px regular, color #999
- Stat value: 18px bold

---

## Haptic Feedback Map

| Action | Haptic Type |
|--------|-------------|
| Tap setting row | haptics.light() |
| Toggle notification | haptics.light() |
| Change currency | haptics.light() |
| Save profile | haptics.success() |
| Change password | haptics.success() |
| Export data | haptics.success() |
| Sign out tap | haptics.warning() |
| Sign out confirmed | haptics.success() |
| Delete account tap | haptics.warning() |
| Delete account confirmed | haptics.error() |
| Validation error | haptics.error() |

---

## Toast Messages

| Action | Type | Text1 | Text2 |
|--------|------|-------|-------|
| Profile updated | success | "✅ Profile updated" | "Changes saved." |
| Password changed | success | "🔒 Password updated" | "Your new password is set." |
| Password too short | error | "Password too short" | "Must be at least 6 characters." |
| Password mismatch | error | "Passwords don't match" | "Please try again." |
| Currency changed | success | "💰 Currency updated" | "Now using [CODE]" |
| Notifications on | success | "🔔 Notifications enabled" | "" |
| Notifications off | success | "🔕 Notifications disabled" | "" |
| Export success | success | "📤 Data exported" | "File ready to share." |
| Export failed | error | "Export failed" | "Please try again." |
| Sign out | success | "👋 Signed out" | "See you next time!" |
| Delete account | success | "Account deleted" | "All data removed." |
| Generic error | error | "Something went wrong" | error.message |

---

## Component Props Reference

### ProfileHeader
```
Props:
- username: string
- email: string
- avatarUrl: string (nullable)
- onEditPress: function
```

### JourneyStats
```
Props:
- stats: {
    memberSince: string (date)
    totalLogged: number
    waiting: number
    cured: number
    bought: number
    totalSaved: number
    avgImpulse: number
  }
```

### SettingRow
```
Props:
- icon: string (emoji)
- label: string
- value: string (optional, shown on right)
- onPress: function
- showArrow: boolean (default true)
- danger: boolean (default false, makes text red)
```

### SettingToggle
```
Props:
- icon: string (emoji)
- label: string
- value: boolean
- onToggle: function
```

### EditProfileModal
```
Props:
- visible: boolean
- currentUsername: string
- onSave: function(newUsername)
- onCancel: function
```

### ChangePasswordModal
```
Props:
- visible: boolean
- onSave: function(newPassword)
- onCancel: function
```

### CurrencyPicker
```
Props:
- visible: boolean
- currentCurrency: string
- onSelect: function(currencyCode)
- onCancel: function
```

---

## MMKV Storage Keys

Store these settings locally:
- `notifications_enabled` (boolean, default true)
- `last_export_date` (string, ISO date, for reference)

Example usage:
```js
import { MMKV } from 'react-native-mmkv'
const storage = new MMKV()

// Get
const notificationsEnabled = storage.getBoolean('notifications_enabled') ?? true

// Set
storage.set('notifications_enabled', false)
```

---

## Zustand Auth Store Update

The auth store should have a clear function:
```js
// src/stores/authStore.js
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  
  updateProfile: (updates) => set((state) => ({
    profile: { ...state.profile, ...updates }
  })),
  
  clearAuth: () => set({ user: null, profile: null }),
}))
```

---

## Sign Out Flow Implementation

```js
import { router } from 'expo-router'
import { Alert } from 'react-native'

const handleSignOut = () => {
  haptics.warning()
  
  Alert.alert(
    'Sign Out',
    'Are you sure you want to sign out?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.auth.signOut()
            clearAuth()
            haptics.success()
            Toast.show({
              type: 'success',
              text1: '👋 Signed out',
              text2: 'See you next time!',
            })
            router.replace('/(auth)/login')
          } catch (error) {
            haptics.error()
            Toast.show({
              type: 'error',
              text1: 'Sign out failed',
              text2: error.message,
            })
          }
        },
      },
    ]
  )
}
```

---

## Delete Account Flow Implementation

```js
const handleDeleteAccount = () => {
  haptics.warning()
  
  Alert.prompt(
    'Delete Account',
    'This will permanently delete your account and all data. Type DELETE to confirm.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async (text) => {
          if (text !== 'DELETE') {
            Toast.show({
              type: 'error',
              text1: 'Confirmation failed',
              text2: 'You must type DELETE exactly.',
            })
            return
          }
          
          try {
            await profileService.deleteAccount(user.id)
            haptics.error()
            Toast.show({
              type: 'success',
              text1: 'Account deleted',
              text2: 'All data removed.',
            })
            clearAuth()
            router.replace('/(auth)/login')
          } catch (error) {
            haptics.error()
            Toast.show({
              type: 'error',
              text1: 'Delete failed',
              text2: error.message,
            })
          }
        },
      },
    ],
    'plain-text'
  )
}
```

---

## Loading & Error States

### Loading State
- Show loading spinner while fetching profile and stats
- Use a centered ActivityIndicator with text "Loading your profile..."

### Error State
- If fetch fails, show error message with retry button
- Show toast notification

### Pull to Refresh
- Implement RefreshControl on the ScrollView
- Reload all profile data and stats
- Show toast: "Profile refreshed"

### Empty Stats
- If user has no items yet, show: "Start your journey by adding your first want!"
- Include a button that navigates to Waiting tab

---

## Important Implementation Notes

1. All Supabase calls must use the authenticated user's ID from Zustand auth store
2. All settings rows must have haptic feedback on press
3. Sign out must clear the Zustand store completely
4. Sign out must redirect to the login screen using `router.replace`
5. The screen should show a loading spinner while fetching profile and stats
6. Pull to refresh should reload all profile data and stats
7. The notification toggle should persist across app restarts using MMKV storage
8. Currency changes should save to Supabase immediately
9. All modals should use `animationType="slide"` and `presentationStyle="pageSheet"`
10. All form inputs should have proper validation before submission
11. The delete account feature should require typing "DELETE" as confirmation
12. Export data should work on both iOS and Android
13. Use dayjs for all date formatting (e.g., "January 15, 2025")
14. Use Alert.alert for confirmation dialogs
15. Use Alert.prompt for the delete confirmation (iOS) — fallback for Android needs custom modal
16. Always wrap Supabase calls in try/catch with proper error handling
17. Show appropriate toast for every user action (success or error)
18. The Profile tab icon should change color when active (orange)

---

## Acceptance Criteria

- [ ] Profile screen shows user avatar placeholder with first letter
- [ ] Username and email are displayed correctly
- [ ] Edit profile modal opens and updates username
- [ ] Journey stats show correct numbers from database
- [ ] Currency picker works and saves to Supabase
- [ ] Notification toggle works and persists locally via MMKV
- [ ] Export data creates and shares a JSON file
- [ ] Change password modal works with validation
- [ ] Sign out clears state and redirects to login
- [ ] Delete account removes all data and redirects
- [ ] All buttons have haptic feedback
- [ ] All actions show appropriate toasts
- [ ] Loading state shows while fetching data
- [ ] Pull to refresh reloads all data
- [ ] Empty/error states are handled gracefully
- [ ] Profile tab appears in bottom tab bar
- [ ] All components follow the design system colors and styling
- [ ] All modals work properly on both iOS and Android
- [ ] dayjs is used for date formatting
- [ ] All Supabase calls are properly authenticated

---

## End of Phase 13 Specification