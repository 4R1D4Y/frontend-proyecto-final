import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeTranslations } from '../lang/homeTranslations';

const Home = () => {
  const { user, lang } = useAuth();
  const t = homeTranslations[lang];

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>{t.title}</h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>
        {t.description}
      </p>
      
      <div style={{ marginTop: '30px' }}>
        {user ? (
          <Link to="/explore" style={btnStyle}>{t.explore}</Link>
        ) : (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link to="/login" style={btnStyle}>{t.login}</Link>
            <Link to="/register" style={{ ...btnStyle, background: '#eee', color: '#333' }}>{t.register}</Link>
          </div>
        )}
      </div>
    </div>
  );
};

const btnStyle = {
  padding: '12px 24px',
  background: '#1db954',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '25px',
  fontWeight: 'bold'
};

export default Home;