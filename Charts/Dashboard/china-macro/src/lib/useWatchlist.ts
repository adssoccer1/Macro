"use client"

import * as React from "react"

const KEY = "market_watchlist_v1"

export function useWatchlist(defaultIds: string[] = []) {
  const [ids, setIds] = React.useState<string[]>(defaultIds)

  // load once
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setIds(parsed)
      } else if (defaultIds.length) {
        localStorage.setItem(KEY, JSON.stringify(defaultIds))
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = (next: string[]) => {
    setIds(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  const add = (id: string) => save([...new Set([...ids, id])])
  const remove = (id: string) => save(ids.filter((x) => x !== id))
  const toggle = (id: string) => (ids.includes(id) ? remove(id) : add(id))
  const clear = () => save([])

  return { ids, add, remove, toggle, clear, set: save }
}