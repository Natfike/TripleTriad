import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './styles/global.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes.tsx'
import './i18n'
import { SocketProvider } from './context/SocketContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  </StrictMode>,
)
