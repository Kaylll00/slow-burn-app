// src/services/wantsService.js
import dayjs from 'dayjs'
import { supabase } from './supabase'

export const wantsService = {

  // CREATE
  addWant: async (userId, wantData) => {
    const waitUntil = dayjs()
      .add(wantData.wait_days, 'day')
      .toISOString()

    const { data, error } = await supabase
      .from('wants')
      .insert({
        user_id: userId,
        item_name: wantData.item_name,
        price: wantData.price,
        category: wantData.category,
        reason_i_want_it: wantData.reason,
        wait_days: wantData.wait_days,
        wait_until: waitUntil,
        status: 'waiting',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // READ - Get all wants by status
  getWantsByStatus: async (userId, status) => {
    const { data, error } = await supabase
      .from('wants')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // READ - Get single want
  getWantById: async (id) => {
    const { data, error } = await supabase
      .from('wants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // UPDATE - Edit want details
  updateWant: async (id, updates) => {
    const { data, error } = await supabase
      .from('wants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // UPDATE - Mark as Bought
  markAsBought: async (id, want) => {
    const decidedAt = dayjs().toISOString()
    const waitUntil = dayjs(want.wait_until)
    const now = dayjs()

    // Calculate impulse score (bought before wait period = high score)
    const impulseScore = now.isBefore(waitUntil)
      ? Math.round((waitUntil.diff(now, 'hour') / (want.wait_days * 24)) * 100)
      : 0

    const { data, error } = await supabase
      .from('wants')
      .update({
        status: 'bought',
        decided_at: decidedAt,
        impulse_score: impulseScore,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // UPDATE - Mark as Cured (you no longer want it)
  markAsCured: async (id, userId, want) => {
    const { data, error } = await supabase
      .from('wants')
      .update({
        status: 'cured',
        decided_at: dayjs().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Log the savings
    await supabase.from('savings_log').insert({
      user_id: userId,
      want_id: id,
      item_name: want.item_name,
      amount_saved: want.price,
      category: want.category,
    })

    return data
  },

  // DELETE
  deleteWant: async (id) => {
    const { error } = await supabase
      .from('wants')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

}