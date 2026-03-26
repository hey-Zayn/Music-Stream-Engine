import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './Providers/AuthProvider.tsx'
import { Toaster } from 'react-hot-toast'
import * as Sentry from "@sentry/react";
import { initSentry } from './lib/sentry'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

// Initialize Sentry
initSentry();

const SentryRoutes = Sentry.withSentryRouting(BrowserRouter);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthProvider>
        <SentryRoutes>
          <Sentry.ErrorBoundary fallback={<div>An error has occurred</div>} showDialog>
            <App/>
            <Toaster
              position='top-center'
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#18181b', // zinc-900
                  color: '#fff',
                  border: '1px solid #27272a', // zinc-800
                  borderRadius: '8px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981', // emerald-500
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444', // red-500
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Sentry.ErrorBoundary>
        </SentryRoutes>
      </AuthProvider>
    </ClerkProvider>
  </StrictMode>,
)