// src/App.jsx
// Main router — protects pages based on role using ProtectedRoute
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';

// Public pages
import HomePage           from './pages/HomePage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import ForgotPasswordPage from './pages/Forgotpasswordpage';
import About              from './pages/About';

// Student pages
import StudentDashboard   from './pages/Studentdashboard';
import StudentCV          from './pages/Studentcv';
import SearchInternships  from './pages/Searchintership';
import MyApplications     from './pages/Applicatios';
import InternshipDetail   from './pages/Intershipsdetail';

// Company pages
import CompanyDashboard   from './pages/Companydashboard';
import CompanyProfile     from './pages/Companyprofile';
import CompanyOffers      from './pages/Companyoffers';
import CompanyCandidates  from './pages/Companycandidates';

// Admin pages
import AdminDashboard     from './pages/AdminDashboard';
import AdminPending       from './pages/AdminPending';
import AdminDocuments     from './pages/AdminDocuments';
import AdminUsers         from './pages/AdminUsers';
import AdminSkills        from './pages/AdminSkills';

// Protects a route — redirects to /login if not authenticated, or to / if wrong role
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<HomePage />} />
      <Route path="/about"          element={<About />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/register"       element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Student — STUDENT role only */}
      <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/cv"        element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentCV /></ProtectedRoute>} />
      <Route path="/search"            element={<ProtectedRoute allowedRoles={['STUDENT']}><SearchInternships /></ProtectedRoute>} />
      <Route path="/applications"      element={<ProtectedRoute allowedRoles={['STUDENT']}><MyApplications /></ProtectedRoute>} />
      <Route path="/intershipsdetails" element={<ProtectedRoute allowedRoles={['STUDENT']}><InternshipDetail /></ProtectedRoute>} />

      {/* Company — COMPANY role only */}
      <Route path="/company/dashboard"        element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyDashboard /></ProtectedRoute>} />
      <Route path="/company/profile"          element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyProfile /></ProtectedRoute>} />
      <Route path="/company/offers"           element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyOffers /></ProtectedRoute>} />
      <Route path="/company/candidates"       element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyCandidates /></ProtectedRoute>} />
      <Route path="/company/candidates/:offerId" element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyCandidates /></ProtectedRoute>} />

      {/* Admin — ADMIN role only */}
      <Route path="/admin/dashboard"  element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/pending"    element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPending /></ProtectedRoute>} />
      <Route path="/admin/documents"  element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDocuments /></ProtectedRoute>} />
      <Route path="/admin/users"      element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/skills"     element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSkills /></ProtectedRoute>} />
    </Routes>
  );
}