import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PoliticalNewsPage from './pages/PoliticalNewsPage';
import MovieNewsPage from './pages/MovieNewsPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import AdminPage from './pages/AdminPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import ActorLoadingGuard from './components/ActorLoadingGuard';

// Root layout with Header and Footer, wrapped in actor loading guard
function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex-1">
        <ActorLoadingGuard>
          <Outlet />
        </ActorLoadingGuard>
      </div>
      <Footer />
    </div>
  );
}

// Route definitions
const rootRoute = createRootRoute({
  component: RootLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const politicalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/political',
  component: PoliticalNewsPage,
});

const moviesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/movies',
  component: MovieNewsPage,
});

const articleDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/article/$id',
  component: ArticleDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const adminReviewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/reviews',
  component: AdminReviewsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  politicalRoute,
  moviesRoute,
  articleDetailRoute,
  adminRoute,
  adminReviewsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
