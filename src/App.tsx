import { useCallback, useEffect, useState } from 'react'
import { PrimeReactProvider } from 'primereact/api'
import { Button } from 'primereact/button'
import Calculator from './components/calculator.tsx'
import { type ThemeMode, applyPrimeTheme, getInitialTheme, resolveIsDark, saveTheme } from './theme.ts'
import styles from './app.module.scss'

const THEME_ICONS: Record<ThemeMode, string> = {
    light: 'pi pi-sun',
    dark: 'pi pi-moon',
    system: 'pi pi-desktop',
}

const THEME_CYCLE: ThemeMode[] = ['light', 'dark', 'system']

const App = () => {
    const [mode, setMode] = useState<ThemeMode>(getInitialTheme)
    const [isDark, setIsDark] = useState(() => resolveIsDark(getInitialTheme()))

    useEffect(() => {
        const dark = resolveIsDark(mode)
        setIsDark(dark)
        applyPrimeTheme(dark)

        if (mode !== 'system') return

        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = () => {
            setIsDark(mq.matches)
            applyPrimeTheme(mq.matches)
        }
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [mode])

    const toggleTheme = useCallback(() => {
        setMode(prev => {
            const next = THEME_CYCLE[(THEME_CYCLE.indexOf(prev) + 1) % THEME_CYCLE.length]
            saveTheme(next)
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
                        icon={THEME_ICONS[mode]}
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