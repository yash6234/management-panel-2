import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Component/Layout/Layout.jsx";
import Login from "./Component/Login Page/Login.jsx";
import Dashboard from "./Component/Dashboard/Dashboard.jsx";
import Masters from "./Component/Masters/Masters.jsx";
import Sales from "./Component/Sales/Sales.jsx";
import Data from "./Component/Data/Data.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route
          path="/dashboard"
          element={

            <Layout />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="masters" element={<Masters />} />
          <Route path="sales" element={<Sales />} />
          <Route path="data" element={<Data />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
