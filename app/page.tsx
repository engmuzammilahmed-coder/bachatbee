'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Deal = {
  id: number
  brand: string
  title: string
  discount: string
  discount_value: number
  old_price: string
  new_price: string
  deal_url: string
  clicks: number
  featured: boolean
  score: number
  category: string
  expires: string
  verified: boolean
  image_url: string
  source: string
}

export default function Home() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [deals, setDeals] = useState<Deal[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [sources, setSources] = useState<string[]>(['All'])
  const [now, setNow] = useState(new Date())
  const [showMoreCategories, setShowMoreCategories] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Category mapping
  function getCategory(title: string) {
    const t = title.toLowerCase()
    if (!t) return 'Other'

    // Custom categories
    if (t.includes('kameez') || t.includes('kurta')) return 'Shalwar Kameez'
    if (t.includes('jean') || t.includes('trouser') || t.includes('pant') || t.includes('chino') || t.includes('pent')) return 'Trousers'

    // Existing categories
    if (t.includes('shirt') || t.includes('polo')) return 'Shirts'
    if (t.includes('upper') || t.includes('sweater') || t.includes('hoodie')) return 'Upper'
    if (t.includes('jacket') || t.includes('blazer') || t.includes('coat')) return 'Jackets'
    if (t.includes('scarf') || t.includes('accessories') || t.includes('cap') || t.includes('hat')) return 'Accessories'

    return 'Other'
  }

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch deals
  useEffect(() => {
    async function fetchDeals() {
      const { data, error } = await supabase.from('deals').select('*')
      if (error) return console.error(error.message)
      if (!data) return
      const mapped = data.map(d => ({ ...d, category: getCategory(d.title) }))
      setDeals(mapped)
      setCategories(['All', ...Array.from(new Set(mapped.map(d => d.category)))])
      setSources(['All', ...Array.from(new Set(mapped.map(d => d.source)))])
    }
    fetchDeals()
  }, [])

  const rankedDeals = deals
    .map(d => ({
      ...d,
      deal_rank: (d.discount_value || 0) * 0.6 + (d.clicks || 0) * 0.3 + (d.score || 0) * 0.1,
    }))
    .sort((a, b) => b.deal_rank - a.deal_rank)

  const dealOfTheDay =
    rankedDeals.find(d => d.featured) ||
    rankedDeals.reduce(
      (prev, curr) => (curr.discount_value > prev.discount_value ? curr : prev),
      rankedDeals[0]
    )

  const filteredDeals = rankedDeals.filter(deal => {
    const text = (deal.title + deal.brand).toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesCategory = category === 'All' || deal.category.toLowerCase() === category.toLowerCase()
    const matchesSource = sourceFilter === 'All' || deal.source === sourceFilter
    return matchesSearch && matchesCategory && matchesSource
  })

  const handleClick = async (deal: Deal) => {
    if (!deal.id) return
    const { error } = await supabase.from('deals').update({ clicks: (deal.clicks || 0) + 1 }).eq('id', deal.id)
    if (!error) setDeals(prev => prev.map(d => (d.id === deal.id ? { ...d, clicks: (d.clicks || 0) + 1 } : d)))
    if (deal.deal_url) window.open(deal.deal_url, '_blank')
  }

  const computeCountdown = (expires: string) => {
    if (!expires) return null
    const expiresDate = new Date(expires)
    if (isNaN(expiresDate.getTime())) return null
    const diff = Math.max(expiresDate.getTime() - now.getTime(), 0)
    if (diff > 86400000) return null // only show <24h
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${hours}h ${minutes}m ${seconds}s left`
  }

  const maxVisibleCategories = 6
  const visibleCategories = categories.slice(0, maxVisibleCategories)
  const extraCategories = categories.slice(maxVisibleCategories)

  return (
    <main className={darkMode ? 'min-h-screen bg-gray-900 text-white' : 'min-h-screen bg-[#f8f6ef] text-black'}>
      {/* Navbar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center font-black text-xl">🐝</div>
          <h1 className="text-3xl font-black">BachatBee</h1>
        </div>
        <nav className="hidden md:flex items-center gap-10 font-semibold">
          <a href="#">Deals</a>
          <a href="#">Brands</a>
          <a href="#">Alerts</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="bg-[#020223] text-white px-6 py-3 rounded-2xl font-semibold shadow-lg">Submit deal</button>
          <button onClick={() => setDarkMode(!darkMode)} className="px-4 py-2 rounded-xl border font-semibold">{darkMode ? '☀️' : '🌙'}</button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 border border-yellow-300 bg-white px-5 py-3 rounded-full text-sm font-semibold text-orange-600 shadow-sm mb-8">
            ✨ Pakistan's discount comparison hive
          </div>
          <h1 className="text-6xl leading-tight font-black">Compare brand deals before they vanish.</h1>
          <p className="text-xl mt-8 leading-relaxed">Find verified sales, coupons, and limited-time discounts from Pakistani brands in one clean place.</p>
          <div className="bg-white rounded-3xl shadow-xl p-3 flex items-center gap-4 mt-10 border border-gray-100">
            <input type="text" placeholder="Search Khaadi, Daraz, pizza deals..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 outline-none px-4 py-4" />
            <button className="bg-yellow-400 px-8 py-4 rounded-2xl font-bold">Hunt deals</button>
          </div>
        </div>

        {/* Featured Deal / Deal of the Day */}
        {dealOfTheDay && (
          <div className="bg-white rounded-[40px] p-6 shadow-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-[#020223] rounded-[30px] p-6 text-white">
              <span className="text-yellow-400 font-semibold">Deal of the Day</span>
              <h2 className="text-5xl font-black mt-2">{dealOfTheDay.discount}</h2>
              <p className="text-gray-300 font-semibold mt-1">{dealOfTheDay.brand}</p>
              <p className="mt-1">{dealOfTheDay.title}</p>
              <img src={dealOfTheDay.image_url || 'https://placehold.co/600x400'} alt={dealOfTheDay.title} className="rounded-2xl mt-6 h-64 w-full object-cover hover:scale-105 transition-transform duration-300"/>
              <div className="bg-white/10 rounded-3xl p-5 mt-6">
                <p className="text-gray-300">Verified saving</p>
                <h3 className="text-3xl font-black mt-1">{dealOfTheDay.new_price}</h3>
                {dealOfTheDay.expires && <p className="text-red-500 font-semibold mt-1">{computeCountdown(dealOfTheDay.expires)}</p>}
              </div>
              <button onClick={() => handleClick(dealOfTheDay)} className="mt-5 w-full bg-yellow-400 text-black py-3 rounded-xl font-bold">Grab Deal</button>
            </div>
          </div>
        )}
      </section>

      {/* Filters */}
      <div className="px-6 mt-4 flex flex-col gap-2 items-center">
        {/* Sources / Brands */}
        <div className="flex gap-2 flex-wrap justify-center w-full">
          {sources.map(src => (
            <button key={src} onClick={() => setSourceFilter(src)} className={`px-4 py-2 rounded-xl font-semibold ${sourceFilter === src ? 'bg-[#020223] text-white' : 'text-gray-600'}`}>{src}</button>
          ))}
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap justify-center w-full">
          {categories.slice(0, 6).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-xl font-semibold ${category === cat ? 'bg-[#020223] text-white' : 'text-gray-600'}`}>{cat}</button>
          ))}
          {categories.length > 6 && (
            <div className="relative">
              <button onClick={() => setShowMoreCategories(!showMoreCategories)} className="px-4 py-2 rounded-xl font-semibold bg-gray-200">More ▼</button>
              {showMoreCategories && (
                <div className="absolute top-full left-0 bg-white shadow-lg rounded-xl mt-1 z-50">
                  {categories.slice(6).map(cat => (
                    <button key={cat} onClick={() => { setCategory(cat); setShowMoreCategories(false) }} className={`block px-4 py-2 text-left w-full ${category === cat ? 'bg-[#020223] text-white' : 'text-gray-600'}`}>{cat}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Deals Grid */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8">
        {filteredDeals.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">No deals found</p>
        ) : filteredDeals.map((deal, index) => (
          <div key={deal.id} className="bg-white rounded-[30px] p-5 shadow hover:shadow-xl hover:scale-105 transition-all duration-300 relative">
            <img src={deal.image_url || 'https://placehold.co/600x400'} alt={deal.title} className="w-full aspect-[4/5] object-cover rounded-3xl"/>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold mt-2">{deal.brand}</span>
            <span className="absolute top-3 left-3 bg-gray-200 px-2 py-1 rounded text-xs">{deal.category}</span>
            <h3 className="text-lg font-bold mt-2">{deal.title}</h3>
            <p className="text-red-500 font-black text-xl mt-1">{deal.discount}</p>
            <p>{deal.new_price} <span className="line-through text-gray-400">{deal.old_price}</span></p>
            {deal.expires && <p className="text-red-500 font-semibold mt-1">{computeCountdown(deal.expires)}</p>}
            <p className="text-gray-400 mt-1 text-sm">📈 {deal.clicks || 0} clicks</p>
            <button onClick={() => handleClick(deal)} className="mt-4 w-full bg-black text-white py-2 rounded-xl font-bold">View Deal</button>

            {deal.id === dealOfTheDay.id && <div className="absolute top-3 right-3 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">Deal of the Day</div>}
            {index < 5 && deal.id !== dealOfTheDay.id && <div className="absolute top-3 right-3 bg-green-400 text-black px-2 py-1 rounded text-xs font-bold">Top Deal</div>}
          </div>
        ))}
      </div>
    </main>
  )
}