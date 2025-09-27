"use client"

import { useEffect, useMemo, useSyncExternalStore } from "react"

export type AIGoal = {
  title: string
  destination?: string
  time?: string
  days?: string[]
  method?: string
  reason?: string
}

export type GlobalUser = {
  username: string
  goals: string[] // schedule points like "Mon-Fri 9-5 work"
  preferences: string[] // interests like "Live Music", "Parks"
  overrides: string[] // sudden changes like "Find me a place for dinner..."
  ai?: {
    primary?: AIGoal
    goals: AIGoal[]
  }
}

const STORAGE_KEY = "gumo:user"
const IDB_DB_NAME = "gumo-db"
const IDB_STORE = "user"
const IDB_KEY = "global-user"

type Store = {
  get: () => GlobalUser | null
  set: (next: GlobalUser | ((prev: GlobalUser | null) => GlobalUser)) => void
  update: (patch: Partial<GlobalUser>) => void
  subscribe: (cb: () => void) => () => void
}

const listeners = new Set<() => void>()

function readFromStorage(): GlobalUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as GlobalUser) : null
  } catch {
    return null
  }
}

function openUserDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not available"))
      return
    }
    const req = indexedDB.open(IDB_DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbGet(): Promise<GlobalUser | null> {
  const db = await openUserDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly")
    const store = tx.objectStore(IDB_STORE)
    const getReq = store.get(IDB_KEY)
    getReq.onsuccess = () => {
      resolve((getReq.result as GlobalUser) || null)
    }
    getReq.onerror = () => reject(getReq.error)
  })
}

async function idbSet(value: GlobalUser): Promise<void> {
  const db = await openUserDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite")
    const store = tx.objectStore(IDB_STORE)
    const putReq = store.put(value, IDB_KEY)
    putReq.onsuccess = () => resolve()
    putReq.onerror = () => reject(putReq.error)
  })
}

function writeToStorage(value: GlobalUser) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  // best-effort IndexedDB write
  idbSet(value).catch(() => {
    // silently ignore IDB write errors
  })
}

let initializedFromIDB = false
async function initFromIndexedDBOnce() {
  if (typeof window === "undefined" || initializedFromIDB) return
  initializedFromIDB = true
  try {
    const ls = readFromStorage()
    const idb = await idbGet()
    if (idb) {
      // prefer IndexedDB snapshot
      const lsStr = ls ? JSON.stringify(ls) : ""
      const idbStr = JSON.stringify(idb)
      if (lsStr !== idbStr) {
        writeToStorage(idb)
        listeners.forEach((l) => l())
      }
    } else if (ls) {
      // seed IndexedDB from localStorage
      idbSet(ls).catch(() => {})
    }
  } catch {
    // ignore hydration errors
  }
}

const store: Store = {
  get: async () => {
    if (!initializedFromIDB) {
      await initFromIndexedDBOnce()
    }
    return await idbGet()
  },
  set: (next) => {
    const current = store.get()
    const value = typeof next === "function" ? (next as any)(current) : next
    writeToStorage(value)
    listeners.forEach((l) => l())
  },
  update: (patch) => {
    const current = store.get()
    const merged: GlobalUser = {
      username: current?.username || "",
      goals: current?.goals || [],
      preferences: current?.preferences || [],
      overrides: current?.overrides || [],
      ai: current?.ai,
      ...patch,
    }
    writeToStorage(merged)
    listeners.forEach((l) => l())
  },
  subscribe: (cb) => {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
}

export function getUser(): GlobalUser | null {
  return store.get()
}

export function setUser(next: GlobalUser | ((prev: GlobalUser | null) => GlobalUser)) {
  store.set(next)
}

export function updateUser(patch: Partial<GlobalUser>) {
  store.update(patch)
}

export function useUser() {
  const snapshot = useSyncExternalStore(store.subscribe, store.get, store.get)
  // ensure a stable non-null object for easier consumption in components
  const user = useMemo<GlobalUser>(() => {
    return (
      snapshot ?? {
        username: "",
        goals: [],
        preferences: [],
        overrides: [],
      }
    )
  }, [snapshot])

  useEffect(() => {
    initFromIndexedDBOnce()
  }, [])

  return {
    user,
    setUser,
    updateUser,
  }
}
