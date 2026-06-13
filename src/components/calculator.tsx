import { type FC, useMemo, useState } from 'react'
import { InputNumber, type InputNumberValueChangeEvent } from 'primereact/inputnumber'
import { Divider } from 'primereact/divider'
import { INCOME_TAX_RATES } from '../consts'
import { calculateTax } from '../services'
import { useExchangeRates } from '../hooks/useExchangeRates'
import styles from './calculator.module.scss'

const BRACKET_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#dc2626']

const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(n)

const fmtFx = (n: number, currency: string) =>
    new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(n)

const Calculator: FC = () => {
    const [monthly, setMonthly] = useState(0)
    const { rates, loading: ratesLoading, error: ratesError } = useExchangeRates()

    const yearIncome = useMemo(() => monthly * 12, [monthly])

    const taxArray = useMemo(
        () => calculateTax(yearIncome, INCOME_TAX_RATES),
        [yearIncome],
    )

    const totalTax = useMemo(
        () => taxArray.reduce((sum, t) => sum + t.taxValue, 0),
        [taxArray],
    )

    const netYear = useMemo(() => yearIncome - totalTax, [yearIncome, totalTax])

    const netMonth = useMemo(() => netYear / 12, [netYear])

    const effectiveRate = useMemo(
        () => (yearIncome > 0 ? (totalTax / yearIncome) * 100 : 0),
        [totalTax, yearIncome],
    )

    return (
        <div className={styles.card}>
            {/* ── Income input ─────────────────────────────── */}
            <section className={styles.section}>
                <p className={styles.sectionLabel}>Зарплата до вычета налогов</p>
                <InputNumber
                    value={monthly}
                    onValueChange={(e: InputNumberValueChangeEvent) =>
                        setMonthly(Number(e.value ?? 0))
                    }
                    mode="currency"
                    currency="RUB"
                    locale="ru-RU"
                    min={0}
                    max={99_999_999}
                    className={styles.inputWrapper}
                    inputClassName={styles.input}
                    placeholder="0 ₽"
                />
                <p className={styles.annualHint}>
                    В год:&nbsp;<strong>{fmt(yearIncome)}</strong>
                </p>
            </section>

            <Divider className={styles.divider} />

            {/* ── Tax breakdown ────────────────────────────── */}
            <section className={styles.section}>
                <p className={styles.sectionLabel}>
                    <i className="pi pi-percentage" />
                    Налог НДФЛ
                </p>

                <div className={styles.brackets}>
                    {taxArray.map((item, i) => (
                        <div key={i} className={styles.bracketRow}>
                            <span
                                className={styles.rate}
                                style={{ color: BRACKET_COLORS[i] }}
                            >
                                {(item.rate * 100).toFixed(0)}%
                            </span>
                            <div className={styles.barTrack}>
                                <div
                                    className={styles.barFill}
                                    style={{
                                        width: totalTax > 0
                                            ? `${(item.taxValue / totalTax) * 100}%`
                                            : '0%',
                                        background: BRACKET_COLORS[i],
                                    }}
                                />
                            </div>
                            <span className={styles.bracketValue}>
                                {fmt(item.taxValue)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Итого налог</span>
                    <div className={styles.totalRight}>
                        <span className={styles.totalValue}>{fmt(totalTax)}</span>
                        <span className={styles.rateChip}>
                            {effectiveRate.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </section>

            <Divider className={styles.divider} />

            {/* ── Net income ───────────────────────────────── */}
            <section className={styles.section}>
                <p className={styles.sectionLabel}>
                    <i className="pi pi-wallet" />
                    На руки
                </p>
                <div className={styles.results}>
                    <div className={styles.resultCard}>
                        <span className={styles.resultPeriod}>в месяц</span>
                        <span className={styles.resultAmount}>{fmt(netMonth)}</span>
                    </div>
                    <div className={styles.resultCard}>
                        <span className={styles.resultPeriod}>в год</span>
                        <span className={`${styles.resultAmount} ${styles.yearAmount}`}>
                            {fmt(netYear)}
                        </span>
                    </div>
                </div>
            </section>

            <Divider className={styles.divider} />

            {/* ── Currency equivalent ──────────────────────── */}
            <section className={styles.section}>
                <p className={styles.sectionLabel}>
                    <i className="pi pi-globe" />
                    В валюте
                    {rates && (
                        <span className={styles.rateDate}>
                            курс ЦБ на {rates.date}
                        </span>
                    )}
                </p>

                {ratesLoading && (
                    <p className={styles.fxStatus}>Загрузка курсов…</p>
                )}
                {ratesError && (
                    <p className={styles.fxError}>
                        <i className="pi pi-exclamation-triangle" />
                        {ratesError}
                    </p>
                )}
                {rates && (
                    <div className={styles.fxGrid}>
                        <div className={styles.fxCard}>
                            <span className={styles.fxCurrency}>🇺🇸 USD</span>
                            <div className={styles.fxAmounts}>
                                <span className={styles.fxAmount}>
                                    {fmtFx(netMonth / rates.USD, 'USD')}
                                    <span className={styles.fxPeriod}>/мес</span>
                                </span>
                                <span className={`${styles.fxAmount} ${styles.fxYear}`}>
                                    {fmtFx(netYear / rates.USD, 'USD')}
                                    <span className={styles.fxPeriod}>/год</span>
                                </span>
                            </div>
                        </div>
                        <div className={styles.fxCard}>
                            <span className={styles.fxCurrency}>🇪🇺 EUR</span>
                            <div className={styles.fxAmounts}>
                                <span className={styles.fxAmount}>
                                    {fmtFx(netMonth / rates.EUR, 'EUR')}
                                    <span className={styles.fxPeriod}>/мес</span>
                                </span>
                                <span className={`${styles.fxAmount} ${styles.fxYear}`}>
                                    {fmtFx(netYear / rates.EUR, 'EUR')}
                                    <span className={styles.fxPeriod}>/год</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}

export default Calculator