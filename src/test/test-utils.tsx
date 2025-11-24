/* eslint-disable react-refresh/only-export-components */
// Test utilities file - exports test helpers, not components
import type { ReactElement } from 'react'
import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { FavoritesProvider } from '../contexts/FavoritesContext'
import { SoundCacheProvider } from '../contexts/SoundCacheContext'
import { AudioPlayerProvider } from '../contexts/AudioPlayerContext'

interface AllTheProvidersProps {
  children: React.ReactNode
  initialEntries?: string[]
}

function AllTheProviders({ children, initialEntries }: AllTheProvidersProps) {
  if (initialEntries) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <SoundCacheProvider>
          <FavoritesProvider>
            <AudioPlayerProvider>
              {children}
            </AudioPlayerProvider>
          </FavoritesProvider>
        </SoundCacheProvider>
      </MemoryRouter>
    )
  }

  return (
    <BrowserRouter>
      <SoundCacheProvider>
        <FavoritesProvider>
          <AudioPlayerProvider>
            {children}
          </AudioPlayerProvider>
        </FavoritesProvider>
      </SoundCacheProvider>
    </BrowserRouter>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
}

const customRender = (
  ui: ReactElement,
  { initialEntries, ...renderOptions }: CustomRenderOptions = {}
) => {
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} initialEntries={initialEntries} />,
    ...renderOptions,
  })
}

export * from '@testing-library/react'
export { customRender as render }

