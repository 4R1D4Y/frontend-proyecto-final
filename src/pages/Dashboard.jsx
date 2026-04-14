import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dashBoardTranslations } from '../lang/dashboardTranslations';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Inicializa el hook
  const lang = localStorage.getItem('LANGUAGE_PREF') || 'es';
  const t = dashBoardTranslations[lang];

  const handleLogout = async () => {
    await logout(); // Ejecuta la limpieza de datos
    navigate('/');  // Redirige al Home
  };

  if (!user) return <p>{t.loading}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>{t.title}</h2>
      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
        {/* <p><strong>Nombre:</strong> {user.name}</p> */}
        <p><strong>{t.email}</strong> {user.email}</p>
        <p><strong>{t.role}</strong> {user.role || 'Usuario'}</p>
      </div>
      <button 
        onClick={handleLogout} // Usa la nueva función
        style={{ marginTop: '20px', background: 'red', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}
      >
        {t.logout}
      </button>
    </div>
  );
};

export default Dashboard;