import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { dashBoardTranslations } from '../lang/dashboardTranslations';
import api from '../api/axios';
import '../styles/dashboard.css';

/**
 * Componente Dashboard
 * 
 * Interfaz de perfil de usuario que centraliza la gestión de la cuenta. 
 * Permite la actualización de credenciales (Email/Password) y la eliminación definitiva 
 * del perfil, integrando validaciones en tiempo real y seguridad en el lado del servidor.
 */

const Dashboard = () => {
  // Consumo de lógica de sesión e internacionalización del contexto Auth
  const { user, logout, lang } = useAuth();
  const navigate = useNavigate();
  const t = dashBoardTranslations[lang];

  // Estados locales para la gestión de formularios
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para el manejo selectivo de errores y mensajes de éxito
  const [emailErrors, setEmailErrors] = useState([]);
  const [passErrors, setPassErrors] = useState([]);
  const [emailSuccess, setEmailSuccess] = useState(null);
  const [passSuccess, setPassSuccess] = useState(null);

  /**
   * Validación sintáctica de correo electrónico.
   * Garantiza que el input cumple con el formato estándar antes de la petición PUT.
   */
  const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  /**
   * Actualización de Correo Electrónico.
   * Realiza una petición asíncrona al servidor Laravel para modificar el identificador 
   * de usuario tras superar las validaciones locales.
   */
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailErrors([]);
    setEmailSuccess(null);
    const keys = [];

    if (!newEmail.trim()) keys.push('emptyEmail');
    else if (!validateEmail(newEmail)) keys.push('formatEmail');

    if (keys.length > 0) return setEmailErrors(keys);

    try {
      await api.put('/user/email', { email: newEmail });
      setEmailSuccess('successEmail');
    } catch (err) {
      // Captura de errores específicos del servidor (ej: email ya en uso)
      const msg = err.response?.data?.message || 'connectionError';
      setEmailErrors([msg]);
    }
  };

  /**
   * Actualización de Contraseña.
   * Implementa seguridad de doble factor mediante la confirmación del nuevo password 
   * y la validación de la contraseña actual en el servidor.
   */
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassErrors([]);
    setPassSuccess(null);
    const keys = [];

    if (!currentPassword || !newPassword || !confirmPassword) {
      keys.push('emptyPassword');
    }
    if (newPassword && newPassword.length < 8) {
      keys.push('shortPassword');
    }
    if (newPassword !== confirmPassword) {
      keys.push('matchPassword');
    }

    if (keys.length > 0) return setPassErrors(keys);

    try {
      await api.put('/user/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      setPassSuccess('successPassword');
      // Reseteo de campos de seguridad tras éxito
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      if (err.response?.status === 401) {
        setPassErrors(['currentPassword']); // Error de validación de contraseña actual
      } else {
        setPassErrors(['passwordChangeError']);
      }
    }
  };

  /**
   * Eliminación definitiva de cuenta.
   * Implementa un patrón de confirmación mediante SweetAlert2 para evitar borrados 
   * accidentales. Tras el borrado, se limpia el almacenamiento local (tokens) 
   * y se redirige al usuario.
   */
  const handleDeleteAccount = async () => {
    const confirmDelete = await Swal.fire({
        title: t.confirmDelete_t,
        text: t.confirmDelete_d,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#333',
        confirmButtonText: t.confirmDeleteButtonConfirm,
        cancelButtonText: t.confirmDeleteButtonCancel,
        background: 'var(--color-card)',
        color: '#fff'
    });

    if (confirmDelete.isConfirmed) {
        try {
            await api.delete('/user/delete');
            localStorage.removeItem('AUTH_TOKEN');
            window.location.href = '/';
        } catch (err) {
            Swal.fire('Error', t.deleteAccountError, 'error');
        }
    }
  };

  // Protección de renderizado: si no hay sesión, se muestra estado de carga
  if (!user) return <p>{t.loading}</p>;

  return (
    <div className="dashboard-container">
      {/* Cabecera con título dinámico multidioma */}
      <h2 className="page-title">{t.title}</h2>

      {/* Tarjeta de información estática del perfil */}
      <section className="dashboard-section profile-info-card">
        <div className="info-row">
          <span><strong>{t.email}</strong> {user.email}</span>
          <span><strong>{t.role}</strong> {user.role || 'Usuario'}</span>
        </div>
        <button onClick={logout} className="btn-logout">{t.logout}</button>
      </section>

      {/* Bloque de gestión de Email con feedback de estado */}
      <section className="dashboard-section">
        <h3 className="section-subtitle">{t.secEmail_t}</h3>
        {emailErrors.length > 0 && (
          <div className="status-msg error">
            {emailErrors.map(key => <p key={key}>• {t[key] || key}</p>)}
          </div>
        )}
        {emailSuccess && <p className="status-msg success">{t[emailSuccess]}</p>}
        <form onSubmit={handleUpdateEmail} className="dashboard-form" noValidate>
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="dash-input" />
          <button type="submit" className="btn-dash-update">{t.secEmail_b}</button>
        </form>
      </section>

      {/* Bloque de gestión de Contraseña con validación triple */}
      <section className="dashboard-section">
        <h3 className="section-subtitle">{t.secPassword_t}</h3>
        {passErrors.length > 0 && (
          <div className="status-msg error">
            {passErrors.map(key => <p key={key}>• {t[key] || key}</p>)}
          </div>
        )}
        {passSuccess && <p className="status-msg success">{t[passSuccess]}</p>}
        <form onSubmit={handleUpdatePassword} className="dashboard-form" noValidate>
          <input type="password" placeholder={t.secPassword_placeh_curPass} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="dash-input" />
          <input type="password" placeholder={t.secPassword_placeh_newPass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="dash-input" />
          <input type="password" placeholder={t.secPassword_placeh_confPass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="dash-input" />
          <button type="submit" className="btn-dash-update">{t.secPassword_b}</button>
        </form>
      </section>

      {/* Zona de Peligro: Excluida para administradores por integridad del sistema */}
      { user.role !== "admin" && (
        <>
        <div className="danger-divider"></div>
        <section className="dashboard-section danger-zone">
          <h3 className="danger-title">{t.secDelete_t}</h3>
          <p className="danger-desc">{t.secDelete_d}</p>
          <button onClick={handleDeleteAccount} className="btn-delete-account">{t.secDelete_b}</button>
        </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;