import { useState, useEffect } from 'react';

/**
 * Componente CookieBanner: Gestión de consentimiento legal.
 * 
 * Este componente asegura que la plataforma cumpla con las normativas de privacidad
 * (RGPD) informando al usuario sobre el uso de cookies propias para la mejora 
 * de la experiencia de navegación.
 */

const CookieBanner = () => {
    // Estado de visibilidad: el banner solo se renderiza si no hay consentimiento previo.
    const [isVisible, setIsVisible] = useState(false);
    
    // Obtención del idioma desde localStorage para asegurar que el mensaje
    // sea comprensible incluso antes de que el contexto de autenticación cargue.
    const lang = localStorage.getItem('LANGUAGE_PREF') || 'es';

    useEffect(() => {
        /**
         * Persistencia del consentimiento:
         * Se verifica en el almacenamiento local si el usuario ya aceptó las cookies
         * para evitar mostrar el banner de forma intrusiva en cada visita.
         */
        const consent = localStorage.getItem('COOKIE_CONSENT');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        // Registro del consentimiento en el cliente y cierre del componente.
        localStorage.setItem('COOKIE_CONSENT', 'true');
        setIsVisible(false);
    };

    // Renderizado condicional para no sobrecargar el DOM.
    if (!isVisible) return null;

    return (
        <div style={bannerStyle}>
            <p style={{ margin: 0 }}>
                {lang === 'es' 
                    ? 'Utilizamos cookies propias para mejorar tu experiencia de navegación. Al continuar, aceptas nuestra ' 
                    : 'We use our own cookies to improve your browsing experience. By continuing, you accept our '}
                <a href="/legal" style={{ color: '#1db954' }}>
                    {lang === 'es' ? 'Política de Cookies' : 'Cookies Policy'}
                </a>.
            </p>
            <button onClick={acceptCookies} style={btnStyle}>
                {lang === 'es' ? 'Aceptar' : 'Accept'}
            </button>
        </div>
    );
};

const bannerStyle = {
    position: 'fixed',
    bottom: '100px', // Por encima del reproductor
    left: '20px',
    right: '20px',
    background: '#282828',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
    zIndex: 2000,
};

const btnStyle = {
    background: '#1db954',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginLeft: '20px'
};

export default CookieBanner;