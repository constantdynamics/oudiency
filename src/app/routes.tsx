import { matchRoutes, type RouteObject } from 'react-router';
import { DiscoverPage } from '@/features/discover/DiscoverPage';
import { AppLayout } from './AppLayout';
import { type LazyPage, lazyPage } from './lazyPage';
import { NotFound } from './NotFound';

/*
 * Laden per pagina regelen we zelf (eigen chunk per pagina). Alleen de homepage zit direct in de
 * startbundel: zo is de eerste pagina een rondreis sneller in beeld.
 */
const TimelinePage = lazyPage(() =>
  import('@/features/timeline/TimelinePage').then((m) => m.TimelinePage),
);
const FiguresPage = lazyPage(() =>
  import('@/features/figures/FiguresPage').then((m) => m.FiguresPage),
);
const FigureProfilePage = lazyPage(() =>
  import('@/features/figures/FigureProfilePage').then((m) => m.FigureProfilePage),
);
const SessionsPage = lazyPage(() =>
  import('@/features/sessions/SessionsPage').then((m) => m.SessionsPage),
);
const BookingPage = lazyPage(() =>
  import('@/features/sessions/BookingPage').then((m) => m.BookingPage),
);
const SessionPage = lazyPage(() =>
  import('@/features/sessions/SessionPage').then((m) => m.SessionPage),
);
const LecturesPage = lazyPage(() =>
  import('@/features/lectures/LecturesPage').then((m) => m.LecturesPage),
);
const LectureRequestPage = lazyPage(() =>
  import('@/features/lectures/LectureRequestPage').then((m) => m.LectureRequestPage),
);
const LecturePage = lazyPage(() =>
  import('@/features/lectures/LecturePage').then((m) => m.LecturePage),
);
const ProfilePage = lazyPage(() =>
  import('@/features/profile/ProfilePage').then((m) => m.ProfilePage),
);
const ModerationPage = lazyPage(() =>
  import('@/features/moderation/ModerationPage').then((m) => m.ModerationPage),
);
const AboutPage = lazyPage(() => import('@/features/about/AboutPage').then((m) => m.AboutPage));
const VoiceSettingsPage = lazyPage(() =>
  import('@/features/voice/VoiceSettingsPage').then((m) => m.VoiceSettingsPage),
);
const CallPage = lazyPage(() => import('@/features/voice/CallPage').then((m) => m.CallPage));

function page(path: string, Page: LazyPage): RouteObject {
  return { path, element: <Page />, handle: Page };
}

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DiscoverPage /> },
      page('timeline', TimelinePage),
      page('denkers', FiguresPage),
      page('denkers/:id', FigureProfilePage),
      page('sessies', SessionsPage),
      page('sessies/boeken/:figureId?', BookingPage),
      page('sessies/:id', SessionPage),
      page('colleges', LecturesPage),
      page('colleges/aanvragen/:figureId?', LectureRequestPage),
      page('colleges/:id', LecturePage),
      page('profiel', ProfilePage),
      page('profiel/stem', VoiceSettingsPage),
      page('bellen/:figureId', CallPage),
      page('moderatie', ModerationPage),
      page('over', AboutPage),
      { path: '*', element: <NotFound /> },
    ],
  },
];

/** Haal de chunk van de pagina achter een pad alvast op (bij een deeplink: vóór de eerste render). */
export function preloadRoute(path: string): Promise<unknown> {
  const pages = (matchRoutes(routes, path) ?? []).map((match) => match.route.handle as unknown);
  return Promise.all(pages.map((handle) => (handle as LazyPage | undefined)?.preload()));
}
