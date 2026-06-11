// src/hooks/useAuth.js
import { useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'

export const useAuth = () => {
  const { user, setUser, clearUser } = useAuthStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user }
}