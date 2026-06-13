import lightTheme from 'primereact/resources/themes/lara-light-cyan/theme.css?inline'
import darkTheme from 'primereact/resources/themes/lara-dark-cyan/theme.css?inline'

export type ThemeMode = 'light' | 'dark' | 'system'

const STYLE_ID = 'prime-theme'
const STORAGE_KEY = 'theme-mode'

export function getInitialTheme(): ThemeMode {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    return 'system'
}

export function saveTheme(mode: ThemeMode): void {
    localStorage.setItem(STORAGE_KEY, mode)
}

export function resolveIsDark(mode: ThemeMode): boolean {
    if (mode === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches
    return mode === 'dark'
}

export function applyPrimeTheme(dark: boolean): void {
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!el) {
        el = document.createElement('style')
        el.id = STYLE_ID
        document.head.appendChild(el)
    }
    el.textContent = dark ? darkTheme : lightTheme
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}