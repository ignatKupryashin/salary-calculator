import type {IncomeTaxRate} from "../models/income-tax-rate.ts";

/**
 * Ставки налогообложения НЖФЛ согласно законодательству РФ
 */
export const INCOME_TAX_RATES: IncomeTaxRate[] = [
    {
        income: 2400000,
        rate: 0.13
    },
    {
        income: 5000000,
        rate: 0.15
    },
    {
        income: 20000000,
        rate: 0.18
    },
    {
        income: 50000000,
        rate: 0.20
    },
    {
        income: null,
        rate: 0.22
    }
]