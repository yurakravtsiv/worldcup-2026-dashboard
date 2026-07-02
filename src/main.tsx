import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { Providers } from '@/app/providers'
import '@/index.css'

const enableMsw = import.meta.env.VITE_ENABLE_MSW === 'true'

async function enableMocking() {
  if (!enableMsw) {
    return
  }

  const { worker } = await import('@/mocks/browser')

  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Providers>
        <App />
      </Providers>
    </StrictMode>,
  )
})
