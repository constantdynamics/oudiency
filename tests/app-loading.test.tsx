import { act, render, screen } from '@testing-library/react';
import { type ComponentType, Suspense } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { lazyPage } from '@/app/lazyPage';
import { preloadRoute } from '@/app/routes';

function Ready() {
  return <h1>Klaar</h1>;
}

function chunk() {
  let resolve!: (page: ComponentType) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<ComponentType>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { load: () => promise, resolve, reject };
}

function renderPage(Page: ComponentType) {
  return render(
    <MemoryRouter>
      <ErrorBoundary>
        <Suspense fallback={<p>suspense-fallback</p>}>
          <Page />
        </Suspense>
      </ErrorBoundary>
    </MemoryRouter>,
  );
}

describe('pagina-chunks', () => {
  it('een deeplink: de al opgehaalde pagina wisselt zonder Suspense van laden naar inhoud', async () => {
    const { load, resolve } = chunk();
    const Page = lazyPage(load);
    void Page.preload();
    renderPage(Page);
    expect(screen.getByRole('status')).toHaveTextContent('Even geduld');
    expect(screen.queryByText('suspense-fallback')).not.toBeInTheDocument();
    await act(async () => resolve(Ready));
    expect(screen.getByRole('heading', { name: 'Klaar' })).toBeInTheDocument();
  });

  it('navigeren: een nog niet opgehaalde pagina gaat via React.lazy en Suspense', async () => {
    const { load, resolve } = chunk();
    const Page = lazyPage(load);
    renderPage(Page);
    expect(screen.getByText('suspense-fallback')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await act(async () => resolve(Ready));
    expect(await screen.findByRole('heading', { name: 'Klaar' })).toBeInTheDocument();
  });

  it('mislukt het ophalen, dan toont de foutgrens een melding', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { load, reject } = chunk();
    const Page = lazyPage(load);
    Page.preload().catch(() => undefined);
    renderPage(Page);
    await act(async () => reject(new Error('chunk weg')));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it('preloadRoute haalt alleen de pagina achter het pad op', async () => {
    // De homepage zit in de startbundel: niets op te halen.
    await expect(preloadRoute('/')).resolves.toEqual([undefined, undefined]);
    const [, lecturePage] = (await preloadRoute('/colleges/vb-socrates-agora')) as unknown[];
    expect(lecturePage).toBeTypeOf('function');
  });
});
