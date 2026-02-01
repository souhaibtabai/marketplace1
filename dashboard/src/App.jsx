import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import Dashboard from "./components/Dashboard.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute allowedRoles={["admin", "vendor", "livreur"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute allowedRoles={["admin", "vendor", "livreur"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
