import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// import pages
import Home from './pages/Home';
import About from './pages/About';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Register from './pages/Register';
import Favorites from './pages/Favorites';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Legal from './pages/Legal';
import NotFound from './pages/NotFound';

// import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

// import contexts
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';

// import styles



function App() {
  const { user, lang, changeLanguage } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(180deg,rgba(47, 50, 230, 1) 0%, rgba(0, 0, 0, 1) 50%)' }}>
    <Router>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Ruta Protegida: Usuario Normal */}
          <Route path="/dashboard" element={
              <ProtectedRoute>
                  <Dashboard />
              </ProtectedRoute>
          } />

          <Route path="/favorites" element={
              <ProtectedRoute>
                  <Favorites />
              </ProtectedRoute>
          } />

          {/* Ruta Protegida: SOLO ADMIN */}
          <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
              </ProtectedRoute>
          } />
          <Route path="/legal" element={<Legal />} />

          {/* RUTA NO ENCONTRADA - 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <CookieBanner />
    </Router>
    </div>
  );
}

export default App;