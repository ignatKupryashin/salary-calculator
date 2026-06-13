import { useEffect, useState } from 'react'
import { fetchExchangeRates, type ExchangeRates } from '../services'

interface UseExchangeRatesResult {
    rates: ExchangeRates | null
    loading: boolean
    error: string | null
}

export function useExchangeRates(): UseExchangeRatesResult {
    const [rates, setRates] = useState<ExchangeRates | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchExchangeRates()
            .then(setRates)
            .catch((e: unknown) =>
                setError(e instanceof Error ? e.message : 'Ошибка загрузки курсов')
            )
            .finally(() => setLoading(false))
    }, [])

    return { rates, loading, error }
}