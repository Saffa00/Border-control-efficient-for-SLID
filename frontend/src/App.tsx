import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";

// Public & Gateways
import PortalGatewayPage from "./pages/public/PortalGatewayPage";
import AboutPage from "./pages/public/AboutPage";
import ServicesPage from "./pages/public/ServicesPage";
import BordersPage from "./pages/public/BordersPage";
import ContactPage from "./pages/public/ContactPage";
import ApplicantLandingPage from "./pages/public/ApplicantLandingPage";
import VisaOfficerLandingPage from "./pages/public/VisaOfficerLandingPage";
import BorderOfficerLandingPage from "./pages/public/BorderOfficerLandingPage";
import AdminLandingPage from "./pages/public/AdminLandingPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";
import StaffLoginPage from "./pages/public/StaffLoginPage";
import StaffSignUpPage from "./pages/public/StaffSignUpPage";
import StaffAccessRequestPage from "./pages/public/StaffAccessRequestPage";
import UnauthorizedPage from "./pages/public/UnauthorizedPage";
import AuthCallbackPage from "./pages/public/AuthCallbackPage";

// Applicant portal
import ApplicantDashboard from "./pages/applicant/ApplicantDashboard";
import PassportPage from "./pages/applicant/PassportPage";
import NewVisaApplicationPage from "./pages/applicant/NewVisaApplicationPage";
import ApplicationStatusPage from "./pages/applicant/ApplicationStatusPage";
import PaymentPage from "./pages/applicant/PaymentPage";
import NotificationsPage from "./pages/applicant/NotificationsPage";
import ProfilePage from "./pages/applicant/ProfilePage";

// Visa officer portal
import VisaOfficerDashboard from "./pages/visa-officer/VisaOfficerDashboard";
import ApplicationReviewPage from "./pages/visa-officer/ApplicationReviewPage";

// Immigration/border officer portal
import BorderCheckInPage from "./pages/border-officer/BorderCheckInPage";
import QRVerificationPage from "./pages/border-officer/QRVerificationPage";
import WatchlistPage from "./pages/border-officer/WatchlistPage";
import OverstayReportPage from "./pages/border-officer/OverstayReportPage";

// Admin portal
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagementPage from "./pages/admin/UserManagementPage";
import CheckpointManagementPage from "./pages/admin/CheckpointManagementPage";
import ReportsPage from "./pages/admin/ReportsPage";
import AuditLogPage from "./pages/admin/AuditLogPage";
import { LiveNotificationToast } from "./components/LiveNotificationToast";
import { ApplicantAiChatbot } from "./components/ApplicantAiChatbot";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { PWAOfflineBanner } from "./components/PWAOfflineBanner";
import { MobileAppBottomNav } from "./components/MobileAppBottomNav";
import { MobileBackButton } from "./components/MobileBackButton";
import { ForcedPasswordChangeModal } from "./components/ForcedPasswordChangeModal";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PWAOfflineBanner />
        <PWAInstallPrompt />
        <LiveNotificationToast />
        <ForcedPasswordChangeModal />
        <ApplicantAiChatbot />
        <MobileBackButton />
        <MobileAppBottomNav />
        <Routes>
          {/* Initial Portal Selector ("Who are you? Select Role Portal") */}
          <Route path="/" element={<PortalGatewayPage />} />

          {/* Dedicated Individual Public Information Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/borders" element={<BordersPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Role-Specific Sovereign Landing Pages */}
          <Route path="/applicant" element={<ApplicantLandingPage />} />
          <Route path="/visa/portal" element={<VisaOfficerLandingPage />} />
          <Route path="/visa-officer/portal" element={<Navigate to="/visa/portal" replace />} />
          <Route path="/border/portal" element={<BorderOfficerLandingPage />} />
          <Route path="/border-officer/portal" element={<Navigate to="/border/portal" replace />} />
          <Route path="/admin/portal" element={<AdminLandingPage />} />

          {/* Applicant Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Staff & Admin Gateway & Auth */}
          <Route path="/staff" element={<Navigate to="/staff/login" replace />} />
          <Route path="/staff/login" element={<StaffLoginPage />} />
          <Route path="/staff/signup" element={<StaffSignUpPage />} />
          <Route path="/admin/login" element={<Navigate to="/staff/login" replace />} />
          <Route path="/staff/request-access" element={<StaffAccessRequestPage />} />
          <Route path="/contact-admin" element={<Navigate to="/staff/request-access" replace />} />

          {/* Auth & Error Callbacks */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Applicant portal — any authenticated applicant */}
          <Route element={<ProtectedRoute allowedRoles={["applicant"]} />}>
            <Route path="/dashboard" element={<ApplicantDashboard />} />
            <Route path="/passport" element={<PassportPage />} />
            <Route path="/visa/new" element={<NewVisaApplicationPage />} />
            <Route path="/visa/:id/status" element={<ApplicationStatusPage />} />
            <Route path="/visa/:id/payment" element={<PaymentPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Visa officer portal — visa officers, immigration officers + admins */}
          <Route element={<ProtectedRoute allowedRoles={["visa_officer", "immigration_officer", "admin"]} />}>
            <Route path="/visa-officer" element={<VisaOfficerDashboard />} />
            <Route path="/visa-officer/review/:id" element={<ApplicationReviewPage />} />
          </Route>

          {/* Border officer portal — immigration officers, visa officers + admins */}
          <Route element={<ProtectedRoute allowedRoles={["immigration_officer", "visa_officer", "admin"]} />}>
            <Route path="/border/check-in" element={<BorderCheckInPage />} />
            <Route path="/border/verify" element={<QRVerificationPage />} />
            <Route path="/border/verify-qr" element={<Navigate to="/border/verify" replace />} />
            <Route path="/border/verify/:token" element={<QRVerificationPage />} />
            <Route path="/border/watchlist" element={<WatchlistPage />} />
            <Route path="/border/overstays" element={<OverstayReportPage />} />
            <Route path="/border/overstay-report" element={<Navigate to="/border/overstays" replace />} />
          </Route>

          {/* Admin portal — admins only */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/checkpoints" element={<CheckpointManagementPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/audit-log" element={<AuditLogPage />} />
          </Route>

          {/* 404 Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
