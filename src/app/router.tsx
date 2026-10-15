import { createHashRouter } from 'react-router';
import { AppLayout } from './AppLayout';
import { RouteError } from './RouteError';

/**
 * HashRouter: deeplinks werken op GitHub Pages zonder server-rewrites.
 * Pagina's worden per route lazy geladen (kleinere startbundel).
 */
export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/features/discover/DiscoverPage')).DiscoverPage }),
      },
      {
        path: 'timeline',
        lazy: async () => ({ Component: (await import('@/features/timeline/TimelinePage')).TimelinePage }),
      },
      {
        path: 'denkers',
        lazy: async () => ({ Component: (await import('@/features/figures/FiguresPage')).FiguresPage }),
      },
      {
        path: 'denkers/:id',
        lazy: async () => ({
          Component: (await import('@/features/figures/FigureProfilePage')).FigureProfilePage,
        }),
      },
      {
        path: 'sessies',
        lazy: async () => ({ Component: (await import('@/features/sessions/SessionsPage')).SessionsPage }),
      },
      {
        path: 'sessies/boeken/:figureId?',
        lazy: async () => ({ Component: (await import('@/features/sessions/BookingPage')).BookingPage }),
      },
      {
        path: 'sessies/:id',
        lazy: async () => ({ Component: (await import('@/features/sessions/SessionPage')).SessionPage }),
      },
      {
        path: 'colleges',
        lazy: async () => ({ Component: (await import('@/features/lectures/LecturesPage')).LecturesPage }),
      },
      {
        path: 'colleges/:id',
        lazy: async () => ({ Component: (await import('@/features/lectures/LecturePage')).LecturePage }),
      },
      {
        path: 'profiel',
        lazy: async () => ({ Component: (await import('@/features/profile/ProfilePage')).ProfilePage }),
      },
      {
        path: 'moderatie',
        lazy: async () => ({
          Component: (await import('@/features/moderation/ModerationPage')).ModerationPage,
        }),
      },
      {
        path: 'over',
        lazy: async () => ({ Component: (await import('@/features/about/AboutPage')).AboutPage }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('./NotFound')).NotFound }),
      },
    ],
  },
]);
