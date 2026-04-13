import { useState, useEffect } from 'react';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('COOKIE_CONSENT');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('COOKIE_CONSENT', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={bannerStyle}>
            <p style={{ margin: 0 }}>
                {lang === 'es' ? 'Utilizamos cookies propias para mejorar tu experiencia de navegación. Al continuar, aceptas nuestra ' : 'We use our own cookies to improve your browsing experience. By continuing, you accept our '}
                <a href="/legal" style={{ color: '#1db954' }}>{lang === 'es' ? 'Política de Cookies' : 'Cookies Policy'}</a>.
            </p>
            <button onClick={acceptCookies} style={btnStyle}>{lang === 'es' ? 'Aceptar' : 'Accept'}</button>
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