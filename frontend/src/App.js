import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Test from "./pages/Test";
import Result from "./pages/Result";
import History from "./pages/History";
import Chat from "./pages/Chat";
import Breathing from "./pages/Breathing";
import ProtectedRoute from "./components/ProtectedRoute";
import EmergencyButton from "./components/EmergencyButton";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHistory from "./pages/admin/AdminHistory";
import AdminHighRisk from "./pages/admin/AdminHighRisk";
import AdminArticles from "./pages/admin/AdminArticles";
import { SettingsProvider } from "./contexts/SettingsContext";

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <div className="App">
          <div className="gradient-bg"></div>
          <EmergencyButton />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/test" element={<ProtectedRoute><Test /></ProtectedRoute>} />
            <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/breathing" element={<ProtectedRoute><Breathing /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="history" element={<AdminHistory />} />
              <Route path="severe" element={<AdminHighRisk />} />
              <Route path="articles" element={<AdminArticles />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
