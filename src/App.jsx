import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Legal from './pages/Legal';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Router>
      {/* Mini Navbar para navegar mientras desarrollamos */}
      <nav style={{ padding: '10px', background: '#222', color: 'white', display: 'flex', gap: '15px' }}>
        <Link to="/" style={{ color: 'white' }}>Home</Link>
        <Link to="/explore" style={{ color: 'white' }}>Explore</Link>
        {!user ? (
          <>
          <Link to="/login" style={{ color: 'white' }}>Login</Link>
          <Link to="/register" style={{ color: 'white' }}>Register</Link>
          </>
        ) : (
          <Link to="/dashboard" style={{ color: 'white' }}>Mi Perfil</Link>
        )}
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
    </Router>
    </div>
  );
}

export default App;