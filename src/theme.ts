import lightTheme from 'primereact/resources/themes/lara-light-cyan/theme.css?inline'
import darkTheme from 'primereact/resources/themes/lara-dark-cyan/theme.css?inline'

const STYLE_ID = 'prime-theme'

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