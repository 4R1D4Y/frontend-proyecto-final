import { useState } from 'react'; // Nuevo
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { navbarTranslations } from '../lang/navbarTranslations';
import '../styles/navbar.css';

/**
 * Componente Navbar: Núcleo de navegación de la aplicación.
 * 
 * Este componente gestiona de forma centralizada la navegación, el cambio de idioma
 * y el estado del menú responsive (hamburguesa). Utiliza hooks personalizados
 * para acceder al contexto global de autenticación y preferencias.
 */

const Navbar = () => {
  // Acceso al contexto global mediante hook personalizado useAuth.
  // Permite reaccionar a cambios en el usuario, idioma actual y funciones de control.
  const { user, lang, changeLanguage } = useAuth();
  
  // Estado local para el control del menú desplegable en dispositivos móviles.
  const [isOpen, setIsOpen] = useState(false); 
  
  // Mapeo dinámico de traducciones según el estado global 'lang'.
  const t = navbarTranslations[lang];

  /**
   * Handlers de interfaz:
   * toggleMenu: Alterna la visibilidad del menú móvil.
   * closeMenu: Asegura el cierre del menú al navegar, mejorando la UX.
   */
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="main-nav">
      <div className="nav-logo">
        {/* Uso de 'Link' en lugar de 'NavLink' para evitar estilos de "activo" en el logo */}
        <Link to="/" onClick={closeMenu}>CREO<span>MUSIC</span></Link>
      </div>

      {/* Botón de control de menú responsive con lógica de clases dinámica */}
      <button className={`nav-hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <span></span><span></span><span></span>
      </button>

      {/* 
          Contenedor principal con visibilidad condicionada. 
          En móviles se oculta/muestra mediante la clase 'is-open'.
      */}
      <div className={`nav-menu-container ${isOpen ? 'is-open' : ''}`}>
        <div className="nav-links">
          {/* NavLink añade automáticamente la clase .active si la ruta coincide */}
          <NavLink to="/" end onClick={closeMenu}>{t.home}</NavLink>
          <NavLink to="/about" onClick={closeMenu}>{t.about}</NavLink>
          <NavLink to="/explore" onClick={closeMenu}>{t.explore}</NavLink>
          <NavLink to="/favorites" onClick={closeMenu}>{t.favorites}</NavLink>
        </div>

        <div className="nav-user-actions">
          <div className="nav-links">
            {/* Renderizado condicional basado en la sesión del usuario */}
            {user ? (
              <>
                <NavLink to="/dashboard" className="nav-profile-tag" onClick={closeMenu}>
                  {t.profile}
                </NavLink>
                {/* Control de acceso visual: solo visible para el rol 'admin' */}
                {user.role === 'admin' && (
                  <NavLink to="/admin" className="nav-admin-badge" onClick={closeMenu}>{t.admin}</NavLink>
                )}
              </>
            ) : (
              <NavLink to="/login" onClick={closeMenu}>{t.login}</NavLink>
            )}
          </div>

          {/* Selector de idiomas con actualización de estado en tiempo real */}
          <div className="nav-lang-container">
            <button 
              onClick={() => { changeLanguage('es'); closeMenu(); }} 
              className={lang === 'es' ? 'lang-btn active' : 'lang-btn'}
            >
              ES
            </button>
            <button 
              onClick={() => { changeLanguage('en'); closeMenu(); }} 
              className={lang === 'en' ? 'lang-btn active' : 'lang-btn'}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;