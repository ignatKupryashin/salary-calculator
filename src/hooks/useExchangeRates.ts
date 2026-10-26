import { useQuery } from '@tanstack/react-query'
import { fetchExchangeRates } from '../services'

export function useExchangeRates() {
    const { data: rates = null, isPending: loading, error } = useQuery({
        queryKey: ['exchangeRates'],
        queryFn: fetchExchangeRates,
        staleTime: 24 * 60 * 60 * 1000, // курсы ЦБ обновляются раз в день
    })

    return {
        rates,
        loading,
        error: error
            ? error instanceof Error
                ? error.message
                : 'Ошибка загрузки курсов'
            : null,
    }
}
