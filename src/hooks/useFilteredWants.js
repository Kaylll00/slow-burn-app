import { useMemo } from 'react'


export const useFilteredWants = (wants, { search, category, sortBy }) => {
  return useMemo(() => {
    let filtered = [...wants]

    // Search
    if (search) {
      filtered = filtered.filter(w =>
        w.item_name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Category
    if (category && category !== 'All') {
      filtered = filtered.filter(w => w.category === category)
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'unlock-soon':
        filtered.sort((a, b) => new Date(a.wait_until) - new Date(b.wait_until))
        break
    }

    return filtered
  }, [wants, search, category, sortBy])
}