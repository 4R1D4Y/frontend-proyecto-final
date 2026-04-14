import { useState } from 'react';import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dashBoardTranslations } from '../lang/dashboardTranslations';
import api from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Inicializa el hook
  const lang = localStorage.getItem('LANGUAGE_PREF') || 'es';
  const t = dashBoardTranslations[lang];

  const [newEmail, setNewEmail] = useState(user?.email || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/user/email', { email: newEmail });
      setMessage({ text: res.data.message, type: 'success' });
    } catch (err) {
      // Esto te mostrará el mensaje real de Laravel (ej: "The email has already been taken")
      const errorMsg = err.response?.data?.errors?.email?.[0] 
                    || err.response?.data?.message 
                    || 'Error de conexión';
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
    }
    try {
      await api.put('/user/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      setMessage({ text: 'Contraseña actualizada', type: 'success' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error al actualizar contraseña', type: 'error' });
    }
  };

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

      {message.text && (
        <p style={{ color: message.type === 'success' ? 'green' : 'red', fontWeight: 'bold' }}>
          {message.text}
        </p>
      )}

      {/* SECCIÓN EMAIL */}
      <section style={sectionStyle}>
        <h3>Cambiar Email</h3>
        <form onSubmit={handleUpdateEmail}>
          <input 
            type="email" 
            value={newEmail} 
            onChange={(e) => setNewEmail(e.target.value)} 
            style={inputStyle}
          />
          <button type="submit" style={btnUpdateStyle}>Actualizar Email</button>
        </form>
      </section>

      {/* SECCIÓN CONTRASEÑA */}
      <section style={sectionStyle}>
        <h3>Cambiar Contraseña</h3>
        <form onSubmit={handleUpdatePassword}>
          <input type="password" placeholder="Contraseña actual" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} required />
          <input type="password" placeholder="Nueva contraseña" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} required />
          <input type="password" placeholder="Confirmar nueva contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} required />
          <button type="submit" style={btnUpdateStyle}>Cambiar Contraseña</button>
        </form>
      </section>
      <button 
        onClick={handleLogout} // Usa la nueva función
        style={{ marginTop: '20px', background: 'red', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}
      >
        {t.logout}
      </button>
    </div>
  );
};

const sectionStyle = { marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' };
const inputStyle = { display: 'block', width: '100%', marginBottom: '10px', padding: '8px' };
const btnUpdateStyle = { background: '#1db954', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' };

export default Dashboard;