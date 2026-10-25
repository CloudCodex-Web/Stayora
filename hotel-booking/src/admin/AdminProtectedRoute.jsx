import { Navigate, Outlet } from "react-router-dom";

function AdminProtectedRoute() {
  const isAdminAuthenticated =
    localStorage.getItem("stayora-admin-auth") === "true";

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;
