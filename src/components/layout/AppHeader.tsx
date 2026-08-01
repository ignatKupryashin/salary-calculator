import { Button } from 'primereact/button'
import { type ThemeMode } from '../../theme.ts'
import { useTheme } from '../../providers/ThemeProvider.tsx'
import styles from '../../app.module.scss'

const THEME_ICONS: Record<ThemeMode, string> = {
    light: 'pi pi-sun',
    dark: 'pi pi-moon',
    system: 'pi pi-desktop',
}

const AppHeader = () => {
    const { mode, toggleTheme } = useTheme()

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <i className="pi pi-calculator" />
                <span>Калькуляторы</span>
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
    )
}

export default AppHeader
