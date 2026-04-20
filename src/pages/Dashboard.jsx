import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { dashBoardTranslations } from '../lang/dashboardTranslations';
import api from '../api/axios';

const Dashboard = () => {
  const { user, logout, lang } = useAuth();
  const navigate = useNavigate(); // Inicializa el hook

  // VARIABLE TEXTO
  const t = dashBoardTranslations[lang];

  // VARIABLE EMAIL
  const [newEmail, setNewEmail] = useState(user?.email || '');

  // VARIABLES CONTRASEÑA
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // VARIABLE MENSAJE
  const [message, setMessage] = useState({ text: '', type: '' });

  // MANEJADOR ACTUALIZAR EMAIL
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/user/email', { email: newEmail });
      setMessage({ text: res.data.message, type: 'success' });
    } catch (err) {
      // Esto te mostrará el mensaje real de Laravel (ej: "The email has already been taken")
      const errorMsg = err.response?.data?.errors?.email?.[0] 
                    || err.response?.data?.message 
                    || t.connectionError;
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  // MANEJADOR ACTUALIZAR CONTRASEÑA
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMessage({ text: t.passwordMatchError, type: 'error' });
    }
    try {
      await api.put('/user/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      setMessage({ text: t.passwordChanged, type: 'success' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setMessage({ text: err.response?.data?.message || t.passwordChangeError, type: 'error' });
    }
  };

  // MANEJADOR ELIMINAR CUENTA
  const handleDeleteAccount = async () => {
    // Pedimos confirmación al usuario
    const confirmDelete = await Swal.fire({
        title: t.confirmDelete_t,
        text: t.confirmDelete_d,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#333',
        confirmButtonText: t.confirmDeleteButtonConfirm,
        cancelButtonText: t.confirmDeleteButtonCancel,
        background: '#181818',
        color: '#fff'
    });

    if (confirmDelete.isConfirmed) {
        try {
            // Llamamos a tu ruta: Route::delete('/user/delete', ...)
            await api.delete('/user/delete');
            
            // Limpiamos la sesión en el frontend
            localStorage.removeItem('AUTH_TOKEN');
            window.location.href = '/'; // Redirección forzada a la Home
        } catch (err) {
            setMessage({ 
                text: err.response?.data?.message || t.deleteAccountError, 
                type: 'error' 
            });
        }
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

      <div style={{ background: '#f4f4f4', marginBottom: '10px', padding: '15px', borderRadius: '8px' }}>
        {/* <p><strong>Nombre:</strong> {user.name}</p> */}
        <p><strong>{t.email}</strong> {user.email}</p>
        <p><strong>{t.role}</strong> {user.role || 'Usuario'}</p>

        {/* BOTÓN CERRAR SESIÓN */}
        <button 
          onClick={handleLogout} // Usa la nueva función
          style={{ marginTop: '20px', background: 'red', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}
        >
          {t.logout}
        </button>
      </div>

      {/* MENSAJE DE ACCIERTO/ERROR */}
      {message.text && (
        <p style={{ color: message.type === 'success' ? 'green' : 'red', fontWeight: 'bold' }}>
          {message.text}
        </p>
      )}

      {/* SECCIÓN EMAIL */}
      <section style={sectionStyle}>
        <h3>{t.secEmail_t}</h3>
        <form onSubmit={handleUpdateEmail}>
          <input 
            type="email" 
            value={newEmail} 
            onChange={(e) => setNewEmail(e.target.value)} 
            style={inputStyle}
          />
          <button type="submit" style={btnUpdateStyle}>{t.secEmail_b}</button>
        </form>
      </section>

      {/* SECCIÓN CONTRASEÑA */}
      <section style={sectionStyle}>
        <h3>{t.secPassword_t}</h3>
        <form onSubmit={handleUpdatePassword}>
          <input type="password" placeholder={t.secPassword_placeh_curPass} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} required />
          <input type="password" placeholder={t.secPassword_placeh_newPass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} required />
          <input type="password" placeholder={t.secPassword_placeh_confPass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} required />
          <button type="submit" style={btnUpdateStyle}>{t.secPassword_b}</button>
        </form>
      </section>

      {/* SECCIÓN PELIGROSA: ELIMINAR CUENTA */}
      <section style={{ marginTop: '50px', marginBottom: '50px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3 style={{ color: '#d32f2f' }}>
            {t.secDelete_t}
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
            {t.secDelete_d}
        </p>
        <button 
            onClick={handleDeleteAccount}
            style={{ 
                background: 'white', 
                color: '#d32f2f', 
                border: '1px solid #d32f2f', 
                padding: '10px 20px', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontWeight: 'bold' 
            }}
          >
          {t.secDelete_b}
        </button>
      </section>
    </div>
  );
};

const sectionStyle = { marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' };
const inputStyle = { display: 'block', width: '100%', marginBottom: '10px', padding: '8px' };
const btnUpdateStyle = { background: '#1db954', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' };

export default Dashboard;