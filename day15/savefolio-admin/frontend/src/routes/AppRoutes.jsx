import {
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import useAuth from "../hooks/useAuth";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminTransactionsPage from "../pages/admin/AdminTransactionsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import RegisterPage from "../pages/RegisterPage";
import TransactionsPage from "../pages/TransactionsPage";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace />;
}

function GuestRoute() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated
    ? <Navigate to="/" replace />
    : <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/register"
          element={<RegisterPage />}
        />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route
            path="/transactions"
            element={<TransactionsPage />}
          />
          <Route element={<AdminRoute />}>
            <Route
              path="/admin"
              element={<AdminDashboardPage />}
            />
            <Route
              path="/admin/users"
              element={<AdminUsersPage />}
            />
            <Route
              path="/admin/transactions"
              element={<AdminTransactionsPage />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function AdminRoute() {
  const { user } = useAuth();

  return user?.is_admin
    ? <Outlet />
    : <Navigate to="/" replace />;
}
