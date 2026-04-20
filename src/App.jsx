import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Register from './pages/Register';
import Favorites from './pages/Favorites';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Legal from './pages/Legal';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import NotFound from './pages/NotFound';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';


function App() {
  const { user, lang, changeLanguage } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Router>
      {/* Mini Navbar para navegar mientras desarrollamos */}
      <nav style={navStyle}>
        <h3>Creo Music</h3>
        <Link to="/" style={{ color: 'white' }}>{lang === 'es' ? 'Inicio' : 'Home'}</Link>
        <Link to="/about" style={{ color: 'white' }}>{lang === 'es' ? 'Sobre Creo' : 'About Creo'}</Link>
        <Link to="/explore" style={{ color: 'white' }}>{lang === 'es' ? 'Explorar' : 'Explore'}</Link>
        {!user ? (
          <>
          <Link to="/login" style={{ color: 'white' }}>{lang === 'es' ? 'Logearse' : 'Login'}</Link>
          <Link to="/register" style={{ color: 'white' }}>{lang === 'es' ? 'Registrarse' : 'Register'}</Link>
          </>
        ) : (
          <>
            <Link to="/favorites" style={linkStyle}>{lang === 'es' ? 'Favoritos' : 'Favorites'}</Link>
            <Link to="/dashboard" style={linkStyle}>{lang === 'es' ? 'Mi Perfil' : 'My Profile'}</Link>
            {user.role === 'admin' &&
              <Link to="/admin" style={linkStyle}>{lang === 'es' ? 'Admin' : 'Admin'}</Link>
            }
          </>
         )}

        <div style={langDivStyle}>
          <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{lang === 'es' ? 'Idioma' : 'Language'}:</span>
          {lang === 'es' ? (
            <button onClick={() => changeLanguage('en')} style={langBtnStyle}>EN</button>
          ) : (
            <button onClick={() => changeLanguage('es')} style={langBtnStyle}>ES</button>
          )}
        </div>
      </nav>

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

// Estilos rápidos para los botones de idioma
const navStyle = { 
  padding: '10px 20px', 
  background: '#222', 
  color: 'white', 
  display: 'flex', 
  justifyContent: 'space-between', // Separa links de idiomas
  alignItems: 'center',
  position: 'sticky',
  top: 0,
  zIndex: 1100, // Mayor que el reproductor y las fotos
  boxShadow: '0 2px 10px rgba(0,0,0,0.5)' // Opcional: para que se vea sombra al bajar

};

const linkStyle = { color: 'white', textDecoration: 'none' };

const langBtnStyle = {
  background: 'transparent',
  border: '1px solid #555',
  color: 'white',
  padding: '2px 8px',
  cursor: 'pointer',
  fontSize: '0.7rem',
  borderRadius: '4px'
};

const langDivStyle = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
}