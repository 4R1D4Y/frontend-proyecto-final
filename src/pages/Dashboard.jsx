import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Inicializa el hook

  const handleLogout = async () => {
    await logout(); // Ejecuta la limpieza de datos
    navigate('/');  // Redirige al Home
  };

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Mi Perfil</h2>
      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
        {/* <p><strong>Nombre:</strong> {user.name}</p> */}
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rol:</strong> {user.role || 'Usuario'}</p>
      </div>
      <button 
        onClick={handleLogout} // Usa la nueva función
        style={{ marginTop: '20px', background: 'red', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Dashboard;