export interface ExchangeRates {
    USD: number
    EUR: number
    date: string
}

interface CbrValute {
    Nominal: number
    Value: number
}

interface CbrResponse {
    Date: string
    Valute: Record<string, CbrValute>
}

const CBR_MIRROR_URL = 'https://www.cbr-xml-daily.ru/daily_json.js'

export async function fetchExchangeRates(): Promise<ExchangeRates> {
    const response = await fetch(CBR_MIRROR_URL)
    if (!response.ok) throw new Error(`ЦБ: HTTP ${response.status}`)

    const data: CbrResponse = await response.json()

    const getRate = (code: string): number => {
        const v = data.Valute[code]
        if (!v) throw new Error(`${code} не найден в ответе ЦБ`)
        return v.Value / v.Nominal
    }

    // "2026-06-13T11:30:00+03:00" → "13.06.2026"
    const date = new Date(data.Date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })

    return {
        USD: getRate('USD'),
        EUR: getRate('EUR'),
        date,
    }
}