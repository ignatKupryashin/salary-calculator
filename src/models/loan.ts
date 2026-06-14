export type PaymentType = 'annuity' | 'differential'
export type TermUnit = 'months' | 'years'

export interface LoanParams {
    principal: number
    annualRate: number
    termMonths: number
    paymentDay: number
    startDate: Date
    paymentType: PaymentType
}

export interface PaymentRow {
    number: number
    date: Date
    payment: number
    principalPart: number
    interestPart: number
    balance: number
}

export interface LoanSummary {
    firstPayment: number
    lastPayment: number
    totalPayment: number
    totalInterest: number
    effectiveRate: number
    schedule: PaymentRow[]
}
