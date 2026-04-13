import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Legal from './pages/Legal';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import { useAuth } from './context/AuthContext';


function App() {
  const { user } = useAuth();
  const lang = localStorage.getItem('LANGUAGE_PREF') || 'es';

  // Función para cambiar idioma
  const changeLanguage = (lang) => {
    localStorage.setItem('LANGUAGE_PREF', lang);
    window.location.reload(); 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Router>
      {/* Mini Navbar para navegar mientras desarrollamos */}
      <nav style={{ padding: '10px', background: '#222', color: 'white', display: 'flex', gap: '15px' }}>
        <Link to="/" style={{ color: 'white' }}>{lang === 'es' ? 'Inicio' : 'Home'}</Link>
        <Link to="/explore" style={{ color: 'white' }}>{lang === 'es' ? 'Explorar' : 'Explore'}</Link>
        {!user ? (
          <>
          <Link to="/login" style={{ color: 'white' }}>{lang === 'es' ? 'Logearse' : 'Login'}</Link>
          <Link to="/register" style={{ color: 'white' }}>{lang === 'es' ? 'Registrarse' : 'Register'}</Link>
          </>
        ) : (
          <Link to="/dashboard" style={{ color: 'white' }}>{lang === 'es' ? 'Mi Perfil' : 'My Profile'}</Link>
        )}

        <div style={langDivStyle}>
          <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{lang === 'es' ? 'Idioma' : 'Language'}:</span>
          <button onClick={() => changeLanguage('es')} style={langBtnStyle}>ES</button>
          <button onClick={() => changeLanguage('en')} style={langBtnStyle}>EN</button>
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/legal" element={<Legal />} />
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
  alignItems: 'center' 
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