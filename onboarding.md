# Phase 14 — Onboarding Flow

## Overview

Build a complete first-time user onboarding flow for the Slow Burn app. This is a 3-slide swipeable introduction that explains the app's core concept (anti-impulse purchase tracking) to new users. The onboarding only shows once per user (stored locally in MMKV) and includes a skip option for users who want to bypass it.

---

## Tech Stack (MUST follow these)

- React Native with Expo
- Expo Router for navigation
- react-native-mmkv for local persistence
- expo-haptics for haptic feedback
- react-native built-in components (no extra dependencies needed)

---

## Required Package Installations

All packages should already be installed from previous phases:
- react-native-mmkv
- expo-haptics
- expo-router

No new packages needed for this phase.

---

## File Structure to Create

```
src/
├── app/
│   ├── onboarding.jsx                    ← Main onboarding screen
│   └── index.jsx                          ← Update to check onboarding flag
│
├── components/onboarding/
│   ├── OnboardingSlide.jsx                ← Reusable slide component
│   ├── OnboardingPagination.jsx           ← Dot indicators
│   └── OnboardingButton.jsx               ← Get Started / Next button
│
├── hooks/
│   └── useOnboarding.js                   ← Hook to manage onboarding state
│
└── utils/
    └── storage.js                         ← MMKV storage helper (if not exists)
```

---

## Storage Setup

Create or update: `src/utils/storage.js`

```js
import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

export const STORAGE_KEYS = {
  HAS_SEEN_ONBOARDING: 'has_seen_onboarding',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
}
```

---

## Onboarding Hook

Create: `src/hooks/useOnboarding.js`

This hook manages the onboarding state and persistence.

```js
import { useEffect, useState } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'

export const useOnboarding = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const seen = storage.getBoolean(STORAGE_KEYS.HAS_SEEN_ONBOARDING) ?? false
    setHasSeenOnboarding(seen)
    setLoading(false)
  }, [])

  const completeOnboarding = () => {
    storage.set(STORAGE_KEYS.HAS_SEEN_ONBOARDING, true)
    setHasSeenOnboarding(true)
  }

  const resetOnboarding = () => {
    storage.delete(STORAGE_KEYS.HAS_SEEN_ONBOARDING)
    setHasSeenOnboarding(false)
  }

  return {
    hasSeenOnboarding,
    loading,
    completeOnboarding,
    resetOnboarding,
  }
}
```

---

## Entry Point Routing

Update: `src/app/index.jsx`

This file handles the initial routing logic. It checks:
1. Has the user seen onboarding?
2. Is the user authenticated?

```jsx
import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useAuthStore } from '../stores/authStore'
import { useOnboarding } from '../hooks/useOnboarding'

export default function Index() {
  const { user } = useAuthStore()
  const { hasSeenOnboarding, loading } = useOnboarding()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF5722" />
      </View>
    )
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />
  }

  return <Redirect href="/(tabs)/waiting" />
}
```

---

## Update Root Layout

Update: `src/app/_layout.jsx`

Add the onboarding screen to the stack navigator:

```jsx
import { Stack } from 'expo-router'
import Toast from 'react-native-toast-message'

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <Toast />
    </>
  )
}
```

---

## Onboarding Slides Content

There are exactly 3 slides with the following content:

### Slide 1: "Log Before You Buy"
- Emoji: 📝
- Title: "Log Before You Buy"
- Description: "Before you buy anything, log it in Slow Burn. We'll make you wait — and see if you still want it later."
- Background gradient/color: Light orange tint (#FFF3E0)
- Primary color: #FF5722

### Slide 2: "Wait the Cool-Down"
- Emoji: ⏳
- Title: "Wait the Cool-Down"
- Description: "Choose a wait period: 3, 7, 14, or 30 days. Most impulses fade within 72 hours. Trust the burn."
- Background gradient/color: Light yellow tint (#FFF9C4)
- Primary color: #FF9800

### Slide 3: "Save Money, Build Habits"
- Emoji: 💰
- Title: "Save Money, Build Habits"
- Description: "If you still want it, buy it. If not, you're cured! Track your savings, beat your impulses, build wealth."
- Background gradient/color: Light green tint (#E8F5E9)
- Primary color: #4CAF50

---

## Main Onboarding Screen Implementation

File: `src/app/onboarding.jsx`

### Structure:
- Full-screen view with white background
- Status bar light (since slides have light colored backgrounds)
- Top right: Skip button (only shows on slides 1 and 2)
- Center: Horizontal ScrollView with paging enabled (3 slides)
- Bottom: Pagination dots + action button
- Action button text changes based on slide:
  - Slide 1 & 2: "Next →"
  - Slide 3: "🔥 Get Started"

### Required State:
- `currentSlide` (number, 0-2)
- `scrollRef` (ref for scrollview to programmatically scroll)

### Required Functions:

**handleScroll(event)**
- Detects which slide is currently visible
- Updates currentSlide state based on scroll position
- Calculate: `Math.round(event.nativeEvent.contentOffset.x / screenWidth)`

**handleNext()**
- If not last slide: scroll to next slide
- If last slide: complete onboarding
- Add haptic: `haptics.light()` on next, `haptics.success()` on complete

**handleSkip()**
- Mark onboarding as complete in MMKV
- Navigate to login screen
- Add haptic: `haptics.light()`

**handleComplete()**
- Call `completeOnboarding()` from hook
- Navigate to login screen using `router.replace('/(auth)/login')`
- Add haptic: `haptics.success()`

---

## Slide Component

File: `src/components/onboarding/OnboardingSlide.jsx`

### Props:
- emoji: string
- title: string
- description: string
- backgroundColor: string
- accentColor: string

### Layout:
- Full screen width container
- Centered content vertically
- Padding: 32px horizontal
- Top section (60% height): Large emoji centered in a colored circle
  - Circle: 200px diameter
  - Background: accentColor with 20% opacity
  - Emoji size: 100px
- Bottom section (40% height):
  - Title: 28px bold, centered, color #1A1A1A
  - Margin top: 32px
  - Description: 16px regular, centered, color #666, line height 24px
  - Margin top: 16px
  - Max width: 320px for description

### Animation (optional but recommended):
- Fade in emoji on mount
- Slide up title and description with slight delay

---

## Pagination Component

File: `src/components/onboarding/OnboardingPagination.jsx`

### Props:
- totalSlides: number
- currentSlide: number
- accentColor: string (changes based on current slide)

### Layout:
- Horizontal row of dots
- Centered
- Gap: 8px between dots
- Inactive dot:
  - Width: 8px
  - Height: 8px
  - Border radius: 4px
  - Background: #DDDDDD
- Active dot:
  - Width: 24px (expanded)
  - Height: 8px
  - Border radius: 4px
  - Background: accentColor
  - Animated transition (use Animated API or just smooth state change)

---

## Action Button Component

File: `src/components/onboarding/OnboardingButton.jsx`

### Props:
- label: string
- onPress: function
- backgroundColor: string (default #FF5722)
- icon: string (optional emoji)

### Layout:
- Full width
- Height: 56px
- Border radius: 16px
- Background: backgroundColor
- Centered text
- Text color: white
- Font size: 16px
- Font weight: 700
- Shadow:
  - shadowColor: backgroundColor
  - shadowOffset: { width: 0, height: 4 }
  - shadowOpacity: 0.3
  - shadowRadius: 8
  - elevation: 6

### Behavior:
- Add haptic feedback on press
- Slight scale animation on press (0.96 scale)

---

## Skip Button Styling

The skip button in top right corner:

- Position: absolute, top 50px, right 24px
- Padding: 8px 16px
- Text: "Skip"
- Text color: #999999
- Font size: 14px
- Font weight: 600
- No background, no border
- Only visible on slides 1 and 2 (hide on last slide)

---

## Bottom Section Layout

The bottom section contains pagination + button:

- Position: absolute, bottom 0
- Padding: 32px
- Padding bottom: 48px (extra for safe area)
- Background: white
- Flex direction: column
- Gap: 24px
- Items:
  1. Pagination dots (centered)
  2. Action button (full width)

---

## Screen Layout Summary

```
┌─────────────────────────────────┐
│                          Skip   │ ← Top right (slides 1-2 only)
│                                 │
│                                 │
│         ┌─────────┐             │
│         │         │             │
│         │   📝    │             │ ← Slide content (emoji circle)
│         │         │             │
│         └─────────┘             │
│                                 │
│      Log Before You Buy         │ ← Title
│                                 │
│   Before you buy anything,      │ ← Description
│   log it in Slow Burn...        │
│                                 │
│                                 │
├─────────────────────────────────┤
│         ● ─ ─                   │ ← Pagination
│                                 │
│   ┌─────────────────────────┐   │
│   │      Next →             │   │ ← Action button
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

## ScrollView Configuration

The horizontal ScrollView must have these props:

```jsx
<ScrollView
  ref={scrollRef}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  onScroll={handleScroll}
  scrollEventThrottle={16}
  bounces={false}
>
  {/* 3 slides */}
</ScrollView>
```

### Important:
- Each slide must have `width: screenWidth` (use Dimensions.get('window').width)
- Use scrollRef.current.scrollTo({ x: nextSlide * screenWidth, animated: true }) to programmatically scroll

---

## Color Scheme Per Slide

The screen's accent color should change based on current slide:

| Slide | Background Tint | Accent Color | Circle BG |
|-------|----------------|--------------|-----------|
| 1 | #FFF3E0 | #FF5722 | rgba(255, 87, 34, 0.15) |
| 2 | #FFF9C4 | #FF9800 | rgba(255, 152, 0, 0.15) |
| 3 | #E8F5E9 | #4CAF50 | rgba(76, 175, 80, 0.15) |

The pagination dots and action button color should match the current slide's accent color.

---

## Haptic Feedback Map

| Action | Haptic Type |
|--------|-------------|
| Swipe to next slide | haptics.light() |
| Tap Next button | haptics.light() |
| Tap Skip button | haptics.light() |
| Tap Get Started (final) | haptics.success() |

---

## Animations (Recommended)

### Slide Transition:
- Use the natural ScrollView paging animation
- No need for custom animation

### Dot Pagination:
- Animate width change from 8px to 24px when active
- Use Animated API or LayoutAnimation
- Duration: 300ms

### Button Press:
- Scale down to 0.96 on press in
- Scale back to 1.0 on press out
- Use Animated.spring()

### Emoji Entry:
- Fade in from 0 to 1 opacity
- Scale from 0.8 to 1.0
- Duration: 600ms
- Trigger on slide focus

### Title & Description:
- Fade in with slight delay after emoji
- Translate Y from 20 to 0
- Duration: 400ms

---

## Complete Slide Data Array

Use this exact data structure in your onboarding screen:

```jsx
const SLIDES = [
  {
    id: 1,
    emoji: '📝',
    title: 'Log Before You Buy',
    description: "Before you buy anything, log it in Slow Burn. We'll make you wait — and see if you still want it later.",
    backgroundColor: '#FFF3E0',
    accentColor: '#FF5722',
  },
  {
    id: 2,
    emoji: '⏳',
    title: 'Wait the Cool-Down',
    description: 'Choose a wait period: 3, 7, 14, or 30 days. Most impulses fade within 72 hours. Trust the burn.',
    backgroundColor: '#FFF9C4',
    accentColor: '#FF9800',
  },
  {
    id: 3,
    emoji: '💰',
    title: 'Save Money, Build Habits',
    description: "If you still want it, buy it. If not, you're cured! Track your savings, beat your impulses, build wealth.",
    backgroundColor: '#E8F5E9',
    accentColor: '#4CAF50',
  },
]
```

---

## Styling Reference

### Container Styles:
```js
container: {
  flex: 1,
  backgroundColor: '#FFFFFF',
}
```

### Slide Styles:
```js
slide: {
  width: screenWidth,
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 32,
}

emojiCircle: {
  width: 200,
  height: 200,
  borderRadius: 100,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 48,
}

emoji: {
  fontSize: 100,
}

title: {
  fontSize: 28,
  fontWeight: '800',
  color: '#1A1A1A',
  textAlign: 'center',
  marginBottom: 16,
}

description: {
  fontSize: 16,
  color: '#666666',
  textAlign: 'center',
  lineHeight: 24,
  maxWidth: 320,
}
```

### Skip Button Styles:
```js
skipButton: {
  position: 'absolute',
  top: 50,
  right: 24,
  padding: 8,
  paddingHorizontal: 16,
  zIndex: 10,
}

skipText: {
  fontSize: 14,
  color: '#999999',
  fontWeight: '600',
}
```

### Bottom Section Styles:
```js
bottomSection: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: 32,
  paddingBottom: 48,
  backgroundColor: 'transparent',
  gap: 24,
}

pagination: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
}

dot: {
  height: 8,
  borderRadius: 4,
  backgroundColor: '#DDDDDD',
}

dotInactive: {
  width: 8,
}

dotActive: {
  width: 24,
}
```

### Button Styles:
```js
button: {
  height: 56,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 6,
}

buttonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '700',
}
```

---

## Status Bar Configuration

The status bar should be configured for the onboarding screen:

```jsx
import { StatusBar } from 'expo-status-bar'

<StatusBar style="dark" />
```

This makes the status bar icons dark since the background is light.

---

## Behavior Specifications

### On First Launch:
1. App starts and shows loading spinner briefly
2. Onboarding hook checks MMKV for `has_seen_onboarding` flag
3. If flag is false or doesn't exist → redirect to `/onboarding`
4. If flag is true → proceed to login or main app based on auth state

### During Onboarding:
1. User starts on slide 1
2. User can swipe horizontally between slides
3. Pagination dots update to reflect current slide
4. Background color tint changes smoothly between slides
5. Button color matches current slide's accent color
6. Skip button visible on slides 1 and 2, hidden on slide 3
7. Button label changes:
   - Slides 1 and 2: "Next →"
   - Slide 3: "🔥 Get Started"

### On Skip:
1. Save `has_seen_onboarding = true` to MMKV
2. Navigate to login screen with `router.replace('/(auth)/login')`
3. User never sees onboarding again (unless app data cleared)

### On Get Started (Slide 3):
1. Save `has_seen_onboarding = true` to MMKV
2. Add success haptic feedback
3. Navigate to login screen with `router.replace('/(auth)/login')`

### On Next Button (Slides 1-2):
1. Scroll to next slide programmatically
2. Add light haptic feedback
3. Update currentSlide state

---

## Important Implementation Notes

1. Use `Dimensions.get('window').width` to get screen width for slide sizing
2. Make sure ScrollView has `pagingEnabled={true}` for snap behavior
3. Use `scrollEventThrottle={16}` for smooth scroll detection (60fps)
4. The MMKV write must happen BEFORE navigation to prevent loop
5. Use `router.replace()` instead of `router.push()` to prevent back navigation
6. The onboarding screen should NOT be part of the (auth) or (tabs) groups
7. Place onboarding.jsx directly in `src/app/` folder
8. Hide the status bar bar or set it to "dark" style for visibility
9. Always 