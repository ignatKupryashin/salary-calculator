import {PrimeReactProvider} from 'primereact/api'
import {ThemeProvider} from './providers/ThemeProvider.tsx'
import AppLayout from './components/layout/AppLayout.tsx'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient()

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <PrimeReactProvider>
                <ThemeProvider>
                    <AppLayout/>
                </ThemeProvider>
            </PrimeReactProvider>
        </QueryClientProvider>
    )
}

export default App
