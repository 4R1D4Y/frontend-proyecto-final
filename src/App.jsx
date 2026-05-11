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

/**
 * Componente Principal (App.js)
 * 
 * Actúa como el orquestador global de la aplicación. Define la estructura 
 * semántica del sitio, gestiona el enrutamiento dinámico mediante React Router 
 * y aplica las barreras de seguridad (Middlewares) a las rutas privadas.
 */

function App() {
  // Consumo del contexto de autenticación para posibles ajustes globales de UI
  const { user, lang, changeLanguage } = useAuth();

  return (
    /**
     * Contenedor Principal:
     * Implementa un layout de Flexbox vertical para asegurar que el Footer 
     * siempre se mantenga en la parte inferior (Sticky Footer) y aplica 
     * el degradado de marca corporativo definido en Figma.
     */
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(180deg,rgba(47, 50, 230, 1) 0%, rgba(0, 0, 0, 1) 50%)' }}>
    
    <Router>
      {/* Componentes persistentes: Se mantienen visibles en todas las rutas */}
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          {/* RURAS PÚBLICAS: Accesibles para todos los visitantes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/legal" element={<Legal />} />

          {/* 
              RUTAS PRIVADAS (Usuario): 
              Encapsuladas en 'ProtectedRoute' para validar la sesión 
              antes de permitir el renderizado de la página.
          */}
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

          {/* 
              RUTA PRIVADA (Admin): 
              Implementa restricción adicional mediante el prop 'adminOnly'.
              Solo accesible para usuarios con privilegios de gestión.
          */}
          <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
              </ProtectedRoute>
          } />

          {/* 
              MANEJO DE ERRORES: 
              Captura cualquier ruta no definida y redirige al componente NotFound.
          */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer y aviso de cookies persistentes */}
      <Footer />
      <CookieBanner />
    </Router>
    </div>
  );
}

export default App;