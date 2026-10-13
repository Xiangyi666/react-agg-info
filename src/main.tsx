import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { store } from '@/store'
import { Toaster } from '@/components/ui/sonner'
import { router } from '@/router'
import '@mantine/core/styles.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
        <Toaster />
      </Provider>
    </MantineProvider>
  </StrictMode>
)
