// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import { MMKV } from 'react-native-mmkv'

const createStorageAdapter = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key) =>
        typeof window === 'undefined' ? null : window.localStorage.getItem(key),
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value)
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key)
        }
      },
    }
  }

  const storage = new MMKV()

  return {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  }
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: createStorageAdapter(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
