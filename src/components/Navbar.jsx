import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { navbarTranslations } from '../lang/navbarTranslations';

import '../styles/navbar.css';

const Navbar = () => {
  const { user, lang, changeLanguage } = useAuth();
  const t = navbarTranslations[lang];

  return (
    <nav className="main-nav">
      <div className="nav-logo">
        {/* El logo lo dejamos como Link normal para que no se marque */}
        <Link to="/">CREO<span>MUSIC</span></Link>
      </div>

      <div className="nav-links">
        {/* Usamos NavLink para que detecte la ruta activa */}
        <NavLink to="/" end>{t.home}</NavLink>
        <NavLink to="/about">{t.about}</NavLink>
        <NavLink to="/explore">{t.explore}</NavLink>
        
        {user ? (
          <>
            <NavLink to="/favorites">{t.favorites}</NavLink>
            <NavLink to="/dashboard" className="nav-profile-tag">
              {t.profile}
            </NavLink>
            {user.role === 'admin' && (
              <NavLink to="/admin" className="nav-admin-badge">{t.admin}</NavLink>
            )}
          </>
        ) : (
          <>
            <NavLink to="/login">{t.login}</NavLink>
            <NavLink to="/register" className="nav-register-btn">
              {t.signin}
            </NavLink>
          </>
        )}
      </div>

      <div className="nav-lang-container">
        <button 
          onClick={() => changeLanguage('es')} 
          className={lang === 'es' ? 'lang-btn active' : 'lang-btn'}
        >
          ES
        </button>
        <button 
          onClick={() => changeLanguage('en')} 
          className={lang === 'en' ? 'lang-btn active' : 'lang-btn'}
        >
          EN
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
