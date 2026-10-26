import { TabView, TabPanel } from 'primereact/tabview'
import Calculator from '../salaryCalculator/calculator.tsx'
import LoanCalculator from '../loanCalculator/LoanCalculator.tsx'
import { useTheme } from '../../providers/ThemeProvider.tsx'
import AppHeader from './AppHeader.tsx'
import styles from '../../app.module.scss'

const AppLayout = () => {
    const { isDark } = useTheme()

    return (
        <div className={styles.app} data-theme={isDark ? 'dark' : 'light'}>
            <AppHeader />
            <main className={styles.main}>
                <TabView className={styles.tabs}>
                    <TabPanel header="НДФЛ" leftIcon="pi pi-percentage mr-2">
                        <Calculator />
                    </TabPanel>
                    <TabPanel header="Кредит" leftIcon="pi pi-credit-card mr-2">
                        <LoanCalculator />
                    </TabPanel>
                </TabView>
            </main>
        </div>
    )
}

export default AppLayout
