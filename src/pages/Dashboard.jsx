import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { dashBoardTranslations } from '../lang/dashboardTranslations';
import api from '../api/axios';

import '../styles/dashboard.css';

const Dashboard = () => {
  const { user, logout, lang } = useAuth();
  const navigate = useNavigate();
  const t = dashBoardTranslations[lang];

  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [emailMsg, setEmailMsg] = useState({ text: '', type: '' });
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });

  const [emailErrors, setEmailErrors] = useState([]);
  const [passErrors, setPassErrors] = useState([]);
  const [emailSuccess, setEmailSuccess] = useState(null);
  const [passSuccess, setPassSuccess] = useState(null);


  const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

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
      const msg = err.response?.data?.message || 'connectionError';
      setEmailErrors([msg]);
    }
  };

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
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      if (err.response?.status === 401) {
        setPassErrors(['currentPassword']);
      } else {
        setPassErrors(['passwordChangeError']);
      }
    }
  };

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

  if (!user) return <p>{t.loading}</p>;

  return (
    <div className="dashboard-container">
      <h2 className="page-title">{t.title}</h2>

      {/* SECCIÓN INFORMACIÓN DE CUENTA */}
      <section className="dashboard-section profile-info-card">
        <div className="info-row">
          <span><strong>{t.email}</strong> {user.email}</span>
          <span><strong>{t.role}</strong> {user.role || 'Usuario'}</span>
        </div>
        <button onClick={logout} className="btn-logout">{t.logout}</button>
      </section>

      {/* SECCIÓN CAMBIAR EMAIL */}
      <section className="dashboard-section">
        <h3 className="section-subtitle">{t.secEmail_t}</h3>
        
        {emailErrors.length > 0 && (
          <div className="status-msg error">
            {emailErrors.map(key => <p key={key}>• {t[key] || key}</p>)}
          </div>
        )}
        {emailSuccess && <p className="status-msg success">{t[emailSuccess]}</p>}

        <form onSubmit={handleUpdateEmail} className="dashboard-form" noValidate>
          <input 
            type="email" 
            value={newEmail} 
            onChange={(e) => setNewEmail(e.target.value)} 
            className="dash-input"
          />
          <button type="submit" className="btn-dash-update">{t.secEmail_b}</button>
        </form>
      </section>

      {/* SECCIÓN CAMBIAR CONTRASEÑA */}
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

      { user.role !== "admin" && (
        <>
        {/* SECCIÓN ELIMINAR CUENTA (ZONA PELIGROSA) */}
        <div className="danger-divider"></div>
        <section className="dashboard-section danger-zone">
          <h3 className="danger-title">{t.secDelete_t}</h3>
          <p className="danger-desc">{t.secDelete_d}</p>
          <button onClick={handleDeleteAccount} className="btn-delete-account">
            {t.secDelete_b}
          </button>
        </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;