import { Navigate } from "react-router-dom";
import { getValidAuthUser } from "../Component/Login Page/auth.js";

function ProtectedRoute({ children }) {
  const authUser = getValidAuthUser();
  const isAuthenticated = Boolean(authUser?.token && authUser?.id && authUser?.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
