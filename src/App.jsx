import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Component/Layout/Layout.jsx";
import Login from "./Component/Login Page/Login.jsx";
import Dashboard from "./Component/Dashboard/Dashboard.jsx";
import Masters from "./Component/Masters/Masters.jsx";
import Sales from "./Component/Sales/Sales.jsx";
import Data from "./Component/Data/Data.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import { getValidAuthUser } from "./Component/Login Page/auth.js";

function App() {
  const authUser = getValidAuthUser();
  const isAuthenticated = Boolean(authUser?.token && authUser?.id && authUser?.user);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="masters" element={<Masters />} />
          <Route path="sales" element={<Sales />} />
          <Route path="data" element={<Data />} />
        </Route>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
