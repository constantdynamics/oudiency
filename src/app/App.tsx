import { lazy } from 'react';
import { HashRouter, Route, Routes } from 'react-router';
import { AppLayout } from './AppLayout';
import { ErrorBoundary } from './ErrorBoundary';
import { NotFound } from './NotFound';

/*
 * HashRouter: deeplinks werken op GitHub Pages zonder server-rewrites.
 * Bewust de declaratieve router (geen data-router): die is ~17 kB gzip kleiner, en laden per
 * pagina regelen we zelf met React.lazy (eigen chunk per pagina).
 */
const DiscoverPage = lazy(() =>
  import('@/features/discover/DiscoverPage').then((m) => ({ default: m.DiscoverPage })),
);
const TimelinePage = lazy(() =>
  import('@/features/timeline/TimelinePage').then((m) => ({ default: m.TimelinePage })),
);
const FiguresPage = lazy(() =>
  import('@/features/figures/FiguresPage').then((m) => ({ default: m.FiguresPage })),
);
const FigureProfilePage = lazy(() =>
  import('@/features/figures/FigureProfilePage').then((m) => ({ default: m.FigureProfilePage })),
);
const SessionsPage = lazy(() =>
  import('@/features/sessions/SessionsPage').then((m) => ({ default: m.SessionsPage })),
);
const BookingPage = lazy(() =>
  import('@/features/sessions/BookingPage').then((m) => ({ default: m.BookingPage })),
);
const SessionPage = lazy(() =>
  import('@/features/sessions/SessionPage').then((m) => ({ default: m.SessionPage })),
);
const LecturesPage = lazy(() =>
  import('@/features/lectures/LecturesPage').then((m) => ({ default: m.LecturesPage })),
);
const LecturePage = lazy(() =>
  import('@/features/lectures/LecturePage').then((m) => ({ default: m.LecturePage })),
);
const ProfilePage = lazy(() =>
  import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const ModerationPage = lazy(() =>
  import('@/features/moderation/ModerationPage').then((m) => ({ default: m.ModerationPage })),
);
const AboutPage = lazy(() =>
  import('@/features/about/AboutPage').then((m) => ({ default: m.AboutPage })),
);

export function App() {
  return (
    <HashRouter>
      <ErrorBoundary fullPage>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DiscoverPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="denkers" element={<FiguresPage />} />
            <Route path="denkers/:id" element={<FigureProfilePage />} />
            <Route path="sessies" element={<SessionsPage />} />
            <Route path="sessies/boeken/:figureId?" element={<BookingPage />} />
            <Route path="sessies/:id" element={<SessionPage />} />
            <Route path="colleges" element={<LecturesPage />} />
            <Route path="colleges/:id" element={<LecturePage />} />
            <Route path="profiel" element={<ProfilePage />} />
            <Route path="moderatie" element={<ModerationPage />} />
            <Route path="over" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
}
