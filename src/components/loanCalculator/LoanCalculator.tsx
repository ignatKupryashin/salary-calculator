import { type FC, useMemo, useState } from 'react'
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js'
import { InputNumber, type InputNumberValueChangeEvent } from 'primereact/inputnumber'
import { Divider } from 'primereact/divider'
import { SelectButton, type SelectButtonChangeEvent } from 'primereact/selectbutton'
import { Calendar } from 'primereact/calendar'
import { Chart } from 'primereact/chart'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { calculateLoan } from '../../services'
import type { PaymentType, TermUnit } from '../../models/loan'
import { useTheme } from '../../providers/ThemeProvider.tsx'
import styles from './loanCalculator.module.scss'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const TERM_UNIT_OPTIONS = [
    { label: 'Мес.', value: 'months' },
    { label: 'Лет', value: 'years' },
]

const PAYMENT_TYPE_OPTIONS = [
    { label: 'Аннуитетный', value: 'annuity' },
    { label: 'Дифференцированный', value: 'differential' },
]

const CHART_MAX_BARS = 60

const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(n)

const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)

const LoanCalculator: FC = () => {
    const { isDark } = useTheme()
    const [principal, setPrincipal] = useState(0)
    const [annualRate, setAnnualRate] = useState(0)
    const [term, setTerm] = useState(12)
    const [termUnit, setTermUnit] = useState<TermUnit>('months')
    const [paymentDay, setPaymentDay] = useState(() => new Date().getDate())
    const [startDate, setStartDate] = useState<Date>(() => new Date())
    const [paymentType, setPaymentType] = useState<PaymentType>('annuity')

    const termMonths = useMemo(
        () => (termUnit === 'years' ? term * 12 : term),
        [term, termUnit],
    )

    const summary = useMemo(
        () => calculateLoan({ principal, annualRate, termMonths, paymentDay, startDate, paymentType }),
        [principal, annualRate, termMonths, paymentDay, startDate, paymentType],
    )

    const chartData = useMemo(() => {
        const slice = summary.schedule.slice(0, CHART_MAX_BARS)
        const textColor = isDark ? '#94a3b8' : '#64748b'
        const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'

        return {
            data: {
                labels: slice.map(r => r.number),
                datasets: [
                    {
                        label: 'Основной долг',
                        data: slice.map(r => Math.round(r.principalPart)),
                        backgroundColor: isDark ? '#22d3ee' : '#0891b2',
                        stack: 'payment',
                    },
                    {
                        label: 'Проценты',
                        data: slice.map(r => Math.round(r.interestPart)),
                        backgroundColor: isDark ? '#f87171' : '#ef4444',
                        stack: 'payment',
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: textColor, font: { size: 11 } },
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) =>
                                `${ctx.dataset.label}: ${fmtCurrency(ctx.parsed.y)}`,
                        },
                    },
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: textColor, font: { size: 10 } },
                        grid: { color: gridColor },
                        title: {
                            display: true,
                            text: 'Платёж №',
                            color: textColor,
                            font: { size: 10 },
                        },
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            color: textColor,
                            font: { size: 10 },
                            callback: (v: number | string) => fmtCurrency(Number(v)),
                        },
                        grid: { color: gridColor },
                    },
                },
            },
        }
    }, [summary.schedule, isDark])

    const hasData = summary.schedule.length > 0

    return (
        <div className={styles.card}>
            <section className={styles.section}>
                <p className={styles.sectionLabel}>
                    <i className="pi pi-sliders-h" />
                    Параметры кредита
                </p>

                <div className={styles.inputGrid}>
                    <div className={styles.inputGroup}>
                        <span className={styles.inputLabel}>Сумма кредита</span>
                        <InputNumber
                            value={principal}
                            onValueChange={(e: InputNumberValueChangeEvent) =>
                                setPrincipal(Number(e.value ?? 0))
                            }
                            mode="currency"
                            currency="RUB"
                            locale="ru-RU"
                            min={0}
                            max={999_999_999}
                            className={styles.inputWrapper}
                            inputClassName={styles.input}
                            placeholder="0 ₽"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <span className={styles.inputLabel}>Срок</span>
                        <div className={styles.termRow}>
                            <InputNumber
                                value={term}
                                onValueChange={(e: InputNumberValueChangeEvent) =>
                                    setTerm(Number(e.value ?? 1))
                                }
                                min={1}
                                max={termUnit === 'years' ? 50 : 600}
                                className={`${styles.inputWrapper} ${styles.termInput}`}
                                inputClassName={styles.input}
                            />
                            <SelectButton
                                value={termUnit}
                                options={TERM_UNIT_OPTIONS}
                                onChange={(e: SelectButtonChangeEvent) =>
                                    e.value && setTermUnit(e.value as TermUnit)
                                }
                                className={styles.termToggle}
                                allowEmpty={true}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <span className={styles.inputLabel}>Процентная ставка (% годовых)</span>
                        <InputNumber
                            value={annualRate}
                            onValueChange={(e: InputNumberValueChangeEvent) =>
                                setAnnualRate(Number(e.value ?? 0))
                            }
                            suffix="%"
                            minFractionDigits={0}
                            maxFractionDigits={2}
                            min={0}
                            max={200}
                            locale="ru-RU"
                            className={styles.inputWrapper}
                            inputClassName={styles.input}
                            placeholder="0%"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <span className={styles.inputLabel}>День платежа</span>
                        <InputNumber
                            value={paymentDay}
                            onValueChange={(e: InputNumberValueChangeEvent) =>
                                setPaymentDay(Math.min(28, Math.max(1, Number(e.value ?? 1))))
                            }
                            min={1}
                            max={28}
                            className={styles.inputWrapper}
                            inputClassName={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <span className={styles.inputLabel}>Дата выдачи</span>
                        <Calendar
                            value={startDate}
                            onChange={e => e.value && setStartDate(e.value as Date)}
                            dateFormat="dd.mm.yy"
                            showIcon
                            inputClassName={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <span className={styles.inputLabel}>Тип платежа</span>
                        <SelectButton
                            value={paymentType}
                            options={PAYMENT_TYPE_OPTIONS}
                            onChange={(e: SelectButtonChangeEvent) =>
                                e.value && setPaymentType(e.value as PaymentType)
                            }
                            className={styles.paymentTypeToggle}
                            allowEmpty={true}
                        />
                    </div>
                </div>
            </section>

            <Divider className={styles.divider} />

            <section className={styles.section}>
                <p className={styles.sectionLabel}>
                    <i className="pi pi-wallet" />
                    Итоги
                </p>

                <div className={styles.summaryGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>
                            {paymentType === 'annuity' ? 'Ежемесячный платёж' : 'Первый / последний платёж'}
                        </span>
                        {paymentType === 'annuity' ? (
                            <span className={styles.statValue}>
                                {hasData ? fmtCurrency(summary.firstPayment) : '—'}
                            </span>
                        ) : (
                            <>
                                <span className={styles.statValue}>
                                    {hasData ? fmtCurrency(summary.firstPayment) : '—'}
                                </span>
                                <span className={styles.statSub}>
                                    {hasData ? `последний: ${fmtCurrency(summary.lastPayment)}` : ''}
                                </span>
                            </>
                        )}
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Сумма выплат</span>
                        <span className={styles.statValue}>
                            {hasData ? fmtCurrency(summary.totalPayment) : '—'}
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Переплата</span>
                        <span className={styles.statValue}>
                            {hasData ? fmtCurrency(summary.totalInterest) : '—'}
                        </span>
                        {hasData && principal > 0 && (
                            <span className={styles.statSub}>
                                {((summary.totalInterest / principal) * 100).toFixed(1)}% от суммы кредита
                            </span>
                        )}
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>ПСК (эффективная ставка)</span>
                        <span className={styles.statValue}>
                            {hasData ? `${summary.effectiveRate.toFixed(2)}%` : '—'}
                        </span>
                        <span className={`${styles.pskChip}`}>
                            номинальная годовая
                        </span>
                    </div>
                </div>
            </section>

            {hasData && (
                <>
                    <Divider className={styles.divider} />

                    <section className={styles.section}>
                        <p className={styles.sectionLabel}>
                            <i className="pi pi-chart-bar" />
                            График платежей
                        </p>
                        <div className={styles.chartWrap}>
                            <Chart
                                type="bar"
                                data={chartData.data}
                                options={chartData.options}
                                style={{ height: '100%' }}
                            />
                        </div>
                        {summary.schedule.length > CHART_MAX_BARS && (
                            <p className={styles.chartNote}>
                                Показаны первые {CHART_MAX_BARS} из {summary.schedule.length} платежей
                            </p>
                        )}
                    </section>

                    <Divider className={styles.divider} />

                    <section className={styles.section}>
                        <p className={styles.sectionLabel}>
                            <i className="pi pi-list" />
                            Таблица платежей
                        </p>
                        <div className={styles.tableWrap}>
                            <DataTable
                                value={summary.schedule}
                                scrollable
                                scrollHeight="420px"
                                size="small"
                            >
                                <Column field="number" header="№" style={{ minWidth: '3rem' }} />
                                <Column
                                    header="Дата"
                                    body={(row) => fmtDate(row.date)}
                                    style={{ minWidth: '7rem' }}
                                />
                                <Column
                                    header="Платёж"
                                    body={(row) => fmtCurrency(row.payment)}
                                    style={{ minWidth: '8rem' }}
                                />
                                <Column
                                    header="Осн. долг"
                                    body={(row) => fmtCurrency(row.principalPart)}
                                    style={{ minWidth: '8rem' }}
                                />
                                <Column
                                    header="Проценты"
                                    body={(row) => fmtCurrency(row.interestPart)}
                                    style={{ minWidth: '8rem' }}
                                />
                                <Column
                                    header="Остаток"
                                    body={(row) => fmtCurrency(row.balance)}
                                    style={{ minWidth: '8rem' }}
                                />
                            </DataTable>
                        </div>
                    </section>
                </>
            )}
        </div>
    )
}

export default LoanCalculator
