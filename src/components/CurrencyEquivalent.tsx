import { type FC } from 'react'
import { useExchangeRates } from '../hooks/useExchangeRates'
import styles from './currencyEquivalent.module.scss'

const fmtFx = (n: number, currency: string) =>
    new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(n)

interface Props {
    netMonth: number
    netYear: number
}

const CurrencyEquivalent: FC<Props> = ({ netMonth, netYear }) => {
    const { rates, loading, error } = useExchangeRates()

    return (
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

            {loading && (
                <p className={styles.fxStatus}>Загрузка курсов…</p>
            )}
            {error && (
                <p className={styles.fxError}>
                    <i className="pi pi-exclamation-triangle" />
                    {error}
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
    )
}

export default CurrencyEquivalent