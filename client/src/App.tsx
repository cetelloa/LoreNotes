
import { CreativeBackground } from './components/CreativeBackground';
import { CraftHeader } from './components/CraftHeader';
import { CraftFooter } from './components/CraftFooter';
import { ChatWidget } from './components/ChatWidget';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { TemplatesPage } from './pages/TemplatesPage';
import { BlogPage } from './pages/BlogPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen relative">
          {/* Background Layer */}
          <CreativeBackground />

          {/* Main Content Layer */}
          <div className="relative z-10 max-w-7xl mx-auto min-h-screen flex flex-col">
            <CraftHeader />

            <main className="flex-1 p-4 md:p-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } />
                <Route path="/templates" element={
                  <ProtectedRoute>
                    <TemplatesPage />
                  </ProtectedRoute>
                } />
                <Route path="/blog" element={
                  <ProtectedRoute>
                    <BlogPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>

            <CraftFooter />
          </div>

          {/* Floating Chat Widget */}
          <ChatWidget />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
