import { createContext, useContext, useState, useRef, useCallback } from 'react'

const FilterContext = createContext(null)

export function FilterProvider({ children }) {
  const store = useRef({})
  return (
    <FilterContext.Provider value={store}>
      {children}
    </FilterContext.Provider>
  )
}

export function usePersistedFilters(key, defaults) {
  const store = useContext(FilterContext)
  const initial = store.current[key] ?? defaults
  const [filters, _setFilters] = useState(initial)

  const setFilters = useCallback((val) => {
    _setFilters((prev) => {
      const next = typeof val === 'function' ? val(prev) : val
      store.current[key] = next
      return next
    })
  }, [store, key])

  return [filters, setFilters]
}
