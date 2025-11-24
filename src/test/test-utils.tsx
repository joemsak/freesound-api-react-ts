import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
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
  initialPath?: string
}

const customRender = (
  ui: ReactElement,
  { initialEntries, initialPath, ...renderOptions }: CustomRenderOptions = {}
) => {
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} initialEntries={initialEntries} initialPath={initialPath} />,
    ...renderOptions,
  })
}

export * from '@testing-library/react'
export { customRender as render }

