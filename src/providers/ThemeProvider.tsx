import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import {
    type ThemeMode,
    applyPrimeTheme,
    getInitialTheme,
    resolveIsDark,
    saveTheme,
} from '../theme.ts'

type ThemeContextValue = {
    mode: ThemeMode
    isDark: boolean
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_CYCLE: ThemeMode[] = ['light', 'dark', 'system']

type ThemeProviderProps = {
    children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
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

    const value = useMemo(
        () => ({ mode, isDark, toggleTheme }),
        [mode, isDark, toggleTheme],
    )

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextValue => {
    const ctx = useContext(ThemeContext)
    if (!ctx) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return ctx
}
