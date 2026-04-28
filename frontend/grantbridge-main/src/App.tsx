import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAppStore } from "./lib/store";

const Navbar = lazy(() => import("./components/layout/Navbar"));
const Footer = lazy(() => import("./components/layout/Footer"));
const LandingPage = lazy(() => import("./pages/LandingPage"));

// Auth pages
const SignupPage = lazy(() => import("./pages/SignupPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const VerifyPhonePage = lazy(() => import("./pages/auth/VerifyPhonePage"));
const AccountCreatedPage = lazy(
  () => import("./pages/auth/AccountCreatedPage"),
);
const LinkExpiredPage = lazy(() => import("./pages/auth/LinkExpiredPage"));
const ForgotPasswordPage = lazy(
  () => import("./pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));

// Entrepreneur pages
const EntrepreneurLayout = lazy(
  () => import("./pages/entrepreneur/EntrepreneurLayout"),
);
const EntrepreneurDashboard = lazy(
  () => import("./pages/entrepreneur/EntrepreneurDashboard"),
);
const EntrepreneurOnboarding = lazy(
  () => import("./pages/entrepreneur/EntrepreneurOnboarding"),
);
const MyProjectsPage = lazy(
  () => import("./pages/entrepreneur/MyProjectsPage"),
);

// Funder pages
const FunderLayout = lazy(() => import("./pages/funder/FunderLayout"));
const FunderDashboardPage = lazy(
  () => import("./pages/funder/FunderDashboardPage"),
);
const DiscoverProjectsPage = lazy(
  () => import("./pages/funder/DiscoverProjectsPage"),
);
const HowItWorksPage = lazy(() => import("./pages/funder/HowItWorksPage"));

function DashboardRouter() {
  const { user, isAuthenticated, isFirstLogin } = useAppStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login/entrepreneur" replace />;
  }

  if (user.role === "funder") {
    return <Navigate to="/dashboard/funder" replace />;
  }

  if (isFirstLogin) {
    return <Navigate to="/dashboard/entrepreneur/welcome" replace />;
  }

  return <Navigate to="/dashboard/entrepreneur" replace />;
}

function AppLayout() {
  const location = useLocation();
  const path = location.pathname;

  const isAuthPage =
    path.startsWith("/signup") ||
    path.startsWith("/login") ||
    path.startsWith("/verify-") ||
    path.startsWith("/account-created") ||
    path.startsWith("/link-expired") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password");
  const isDashboard = path.startsWith("/dashboard");
  const showNavbar = !isAuthPage && !isDashboard;
  const showFooter = !isAuthPage && !isDashboard;

  return (
    <>
      {showNavbar && (
        <Suspense
          fallback={
            <div className="min-h-screen grid place-items-center">
              GrantBridge...
            </div>
          }
        >
          <Navbar />
        </Suspense>
      )}
      <Suspense
        fallback={
          <div className="min-h-screen grid place-items-center">Loading...</div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Auth flow */}
          <Route path="/signup/:role" element={<SignupPage />} />
          <Route path="/login/:role" element={<LoginPage />} />
          <Route path="/verify-email/:role" element={<VerifyEmailPage />} />
          <Route path="/verify-phone/:role" element={<VerifyPhonePage />} />
          <Route
            path="/account-created/:role"
            element={<AccountCreatedPage />}
          />
          <Route path="/link-expired/:role" element={<LinkExpiredPage />} />
          <Route
            path="/forgot-password/:role"
            element={<ForgotPasswordPage />}
          />
          <Route path="/reset-password/:role" element={<ResetPasswordPage />} />

          {/* Dashboards */}
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* Entrepreneur — verification onboarding (no navbar) */}
          <Route
            path="/dashboard/entrepreneur/welcome"
            element={<EntrepreneurOnboarding />}
          />

          {/* Entrepreneur — main dashboard with top navbar */}
          <Route
            path="/dashboard/entrepreneur"
            element={<EntrepreneurLayout />}
          >
            <Route index element={<EntrepreneurDashboard />} />
            <Route path="projects" element={<MyProjectsPage />} />
          </Route>

          {/* Funder */}
          <Route path="/dashboard/funder" element={<FunderLayout />}>
            <Route index element={<FunderDashboardPage />} />
            <Route path="discover" element={<DiscoverProjectsPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
          </Route>
        </Routes>
      </Suspense>
      {showFooter && (
        <Suspense
          fallback={
            <div className="min-h-screen grid place-items-center">
              Loading...
            </div>
          }
        >
          <Footer />
        </Suspense>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
