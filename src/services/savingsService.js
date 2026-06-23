import dayjs from 'dayjs'
import { supabase } from './supabase'

const sumAmounts = (rows) =>
  rows.reduce((total, row) => total + Number(row.amount_saved || 0), 0)

export const savingsService = {
  getTotalSavings: async (userId) => {
    const { data, error } = await supabase
      .from('savings_log')
      .select('amount_saved')
      .eq('user_id', userId)

    if (error) throw error
    return sumAmounts(data || [])
  },

  getWeeklySavings: async (userId) => {
    const weekStart = dayjs().startOf('week').toISOString()

    const { data, error } = await supabase
      .from('savings_log')
      .select('amount_saved')
      .eq('user_id', userId)
      .gte('created_at', weekStart)

    if (error) throw error
    return sumAmounts(data || [])
  },

  getSavingsByCategory: async (userId) => {
    const { data, error } = await supabase
      .from('savings_log')
      .select('amount_saved, category')
      .eq('user_id', userId)

    if (error) throw error

    return (data || []).reduce((totals, row) => {
      const category = row.category || 'Other'
      totals[category] = (totals[category] || 0) + Number(row.amount_saved || 0)
      return totals
    }, {})
  },
}
