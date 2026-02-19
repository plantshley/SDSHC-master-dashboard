import { createContext, useContext, useState, useEffect } from 'react'
import { fetchAndParseExcel } from '../utils/excelParser'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL
    fetchAndParseExcel(baseUrl)
      .then((parsed) => {
        setData(parsed)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load data:', err)
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  return (
    <DataContext.Provider value={{ data, isLoading, error }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (ctx === null) {
    throw new Error('useData must be used within a DataProvider')
  }
  return ctx
}
