import type { LoanParams, LoanSummary, PaymentRow } from '../models/loan'

function daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate()
}

function buildPaymentDate(startDate: Date, paymentDay: number, monthOffset: number): Date {
    const d = new Date(startDate)
    d.setDate(1)
    d.setMonth(d.getMonth() + monthOffset)
    d.setDate(Math.min(paymentDay, daysInMonth(d.getFullYear(), d.getMonth())))
    return d
}

function annuitySchedule(params: LoanParams): PaymentRow[] {
    const { principal, annualRate, termMonths, paymentDay, startDate } = params
    const r = annualRate / 12 / 100
    const pow = Math.pow(1 + r, termMonths)
    const monthlyPayment = r === 0
        ? principal / termMonths
        : principal * r * pow / (pow - 1)

    const rows: PaymentRow[] = []
    let balance = principal

    for (let i = 1; i <= termMonths; i++) {
        const interestPart = balance * r
        const principalPart = i === termMonths
            ? balance
            : Math.min(monthlyPayment - interestPart, balance)
        const payment = principalPart + interestPart
        balance = Math.max(balance - principalPart, 0)

        rows.push({
            number: i,
            date: buildPaymentDate(startDate, paymentDay, i),
            payment,
            principalPart,
            interestPart,
            balance,
        })
    }

    return rows
}

function differentialSchedule(params: LoanParams): PaymentRow[] {
    const { principal, annualRate, termMonths, paymentDay, startDate } = params
    const r = annualRate / 12 / 100
    const principalPart = principal / termMonths

    const rows: PaymentRow[] = []
    let balance = principal

    for (let i = 1; i <= termMonths; i++) {
        const interestPart = balance * r
        const actualPrincipal = i === termMonths ? balance : principalPart
        const payment = actualPrincipal + interestPart
        balance = Math.max(balance - actualPrincipal, 0)

        rows.push({
            number: i,
            date: buildPaymentDate(startDate, paymentDay, i),
            payment,
            principalPart: actualPrincipal,
            interestPart,
            balance,
        })
    }

    return rows
}

function computeIRR(cashFlows: number[]): number {
    const npv = (rate: number) =>
        cashFlows.reduce((sum, cf, k) => sum + cf / Math.pow(1 + rate, k), 0)

    const dnpv = (rate: number) =>
        cashFlows.reduce((sum, cf, k) => sum - k * cf / Math.pow(1 + rate, k + 1), 0)

    let rate = 0.01
    for (let i = 0; i < 100; i++) {
        const f = npv(rate)
        const df = dnpv(rate)
        if (Math.abs(df) < 1e-12) break
        const next = rate - f / df
        if (Math.abs(next - rate) < 1e-10) { rate = next; break }
        rate = next
        if (rate < 0) { rate = 0.001 }
        if (rate > 10) { rate = 10 }
    }

    if (!isFinite(rate) || rate < 0) {
        let lo = 0, hi = 10
        for (let i = 0; i < 100; i++) {
            const mid = (lo + hi) / 2
            if (npv(mid) > 0) lo = mid; else hi = mid
            if (hi - lo < 1e-10) { rate = mid; break }
        }
    }

    return rate
}

const EMPTY_SUMMARY: LoanSummary = {
    firstPayment: 0,
    lastPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    effectiveRate: 0,
    schedule: [],
}

export function calculateLoan(params: LoanParams): LoanSummary {
    const { principal, annualRate, termMonths } = params

    if (principal <= 0 || annualRate < 0 || termMonths < 1) {
        return EMPTY_SUMMARY
    }

    const schedule = params.paymentType === 'annuity'
        ? annuitySchedule(params)
        : differentialSchedule(params)

    const totalPayment = schedule.reduce((s, r) => s + r.payment, 0)
    const totalInterest = totalPayment - principal

    const cashFlows = [-principal, ...schedule.map(r => r.payment)]
    const monthlyIRR = annualRate === 0 ? 0 : computeIRR(cashFlows)
    const effectiveRate = monthlyIRR * 12 * 100

    return {
        firstPayment: schedule[0]?.payment ?? 0,
        lastPayment: schedule[schedule.length - 1]?.payment ?? 0,
        totalPayment,
        totalInterest,
        effectiveRate,
        schedule,
    }
}
