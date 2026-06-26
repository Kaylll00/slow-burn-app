import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { supabase } from '../lib/supabase'

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
]

const toNumber = (value) => Number(value ?? 0) || 0

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getJourneyStats(userId) {
  const [totalItemsResult, curedCountResult, boughtCountResult, waitingCountResult, curedItemsResult, boughtItemsResult] =
    await Promise.all([
      supabase.from('wants').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('wants').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'cured'),
      supabase.from('wants').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'bought'),
      supabase.from('wants').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'waiting'),
      supabase.from('wants').select('price').eq('user_id', userId).eq('status', 'cured'),
      supabase
        .from('wants')
        .select('impulse_score')
        .eq('user_id', userId)
        .eq('status', 'bought')
        .not('impulse_score', 'is', null),
    ])

  if (totalItemsResult.error) throw totalItemsResult.error
  if (curedCountResult.error) throw curedCountResult.error
  if (boughtCountResult.error) throw boughtCountResult.error
  if (waitingCountResult.error) throw waitingCountResult.error
  if (curedItemsResult.error) throw curedItemsResult.error
  if (boughtItemsResult.error) throw boughtItemsResult.error

  const curedItems = curedItemsResult.data ?? []
  const boughtItems = boughtItemsResult.data ?? []

  const totalSaved = curedItems.reduce((sum, item) => sum + toNumber(item.price), 0)
  const avgImpulse =
    boughtItems.length > 0
      ? Math.round(boughtItems.reduce((sum, item) => sum + toNumber(item.impulse_score), 0) / boughtItems.length)
      : 0

  return {
    totalLogged: totalItemsResult.count ?? 0,
    waiting: waitingCountResult.count ?? 0,
    cured: curedCountResult.count ?? 0,
    bought: boughtCountResult.count ?? 0,
    totalSaved,
    avgImpulse,
  }
}

export async function exportData(userId) {
  const { data, error } = await supabase
    .from('wants')
    .select('item_name, price, category, reason_i_want_it, status, wait_days, impulse_score, created_at, decided_at')
    .eq('user_id', userId)

  if (error) throw error

  const jsonString = JSON.stringify(data ?? [], null, 2)
  const fileUri = `${FileSystem.documentDirectory}slow-burn-export-${userId}.json`

  await FileSystem.writeAsStringAsync(fileUri, jsonString, {
    encoding: FileSystem.EncodingType.UTF8,
  })

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Export Slow Burn Data',
    })
    return fileUri
  }

  throw new Error('Sharing is not available on this device.')
}

export async function changePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function deleteAccount(userId) {
  const deleteSteps = [
    supabase.from('savings_log').delete().eq('user_id', userId),
    supabase.from('wants').delete().eq('user_id', userId),
    supabase.from('profiles').delete().eq('id', userId),
  ]

  for (const step of deleteSteps) {
    const { error } = await step
    if (error) throw error
  }

  await supabase.auth.signOut()
}