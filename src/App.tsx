import { PrimeReactProvider } from 'primereact/api'
import { ThemeProvider } from './providers/ThemeProvider.tsx'
import AppLayout from './components/layout/AppLayout.tsx'

const App = () => (
    <PrimeReactProvider>
        <ThemeProvider>
            <AppLayout />
        </ThemeProvider>
    </PrimeReactProvider>
)

export default App
