import { useCallback, useState } from 'react'
import { PrimeReactProvider } from 'primereact/api'
import { Button } from 'primereact/button'
import Calculator from './components/calculator.tsx'
import { applyPrimeTheme } from './theme.ts'
import styles from './app.module.scss'

const App = () => {
    const [isDark, setIsDark] = useState(false)

    const toggleTheme = useCallback(() => {
        setIsDark(prev => {
            const next = !prev
            applyPrimeTheme(next)
            return next
        })
    }, [])

    return (
        <PrimeReactProvider>
            <div className={styles.app} data-theme={isDark ? 'dark' : 'light'}>
                <header className={styles.header}>
                    <div className={styles.logo}>
                        <i className="pi pi-percentage" />
                        <span>Калькулятор НДФЛ</span>
                    </div>
                    <Button
                        icon={isDark ? 'pi pi-sun' : 'pi pi-moon'}
                        rounded
                        text
                        aria-label="Переключить тему"
                        onClick={toggleTheme}
                        className={styles.themeBtn}
                    />
                </header>
                <main className={styles.main}>
                    <Calculator />
                </main>
            </div>
        </PrimeReactProvider>
    )
}

export default App