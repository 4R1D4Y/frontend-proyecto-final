import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notFoundTranslations } from '../lang/notFoundTranslations';

import "../styles/notFound.css";

const NotFound = () => {
  const { lang } = useAuth();

  const t = notFoundTranslations[lang];

  return (
    <div className="notfound-container">
      <h1 className="notfound-title">{t.title}</h1>
      
      <div className="glitch-wrapper">
        <span className="error-code">404</span>
      </div>

      <p className="notfound-desc">{t.desc}</p>
      
      <Link to="/" className="btn-notfound">
        {t.button}
      </Link>
    </div>
  );
};

export default NotFound;
