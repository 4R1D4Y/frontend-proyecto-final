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

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailMsg({ text: '', type: '' });
    try {
      const res = await api.put('/user/email', { email: newEmail });
      setEmailMsg({ text: res.data.message, type: 'success' });
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.email?.[0] || err.response?.data?.message || t.connectionError;
      setEmailMsg({ text: errorMsg, type: 'error' });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });
    if (newPassword !== confirmPassword) {
      return setPassMsg({ text: t.passwordMatchError, type: 'error' });
    }
    try {
      await api.put('/user/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      setPassMsg({ text: t.passwordChanged, type: 'success' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setPassMsg({ text: err.response?.data?.message || t.passwordChangeError, type: 'error' });
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
        <form onSubmit={handleUpdateEmail} className="dashboard-form">
          <input 
            type="email" 
            value={newEmail} 
            onChange={(e) => setNewEmail(e.target.value)} 
            className="dash-input"
          />
          <button type="submit" className="btn-dash-update">{t.secEmail_b}</button>
        </form>
        {emailMsg.text && <p className={`status-msg ${emailMsg.type}`}>{emailMsg.text}</p>}
      </section>

      {/* SECCIÓN CAMBIAR CONTRASEÑA */}
      <section className="dashboard-section">
        <h3 className="section-subtitle">{t.secPassword_t}</h3>
        <form onSubmit={handleUpdatePassword} className="dashboard-form">
          <input type="password" placeholder={t.secPassword_placeh_curPass} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="dash-input" required />
          <input type="password" placeholder={t.secPassword_placeh_newPass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="dash-input" required />
          <input type="password" placeholder={t.secPassword_placeh_confPass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="dash-input" required />
          <button type="submit" className="btn-dash-update">{t.secPassword_b}</button>
        </form>
        {passMsg.text && <p className={`status-msg ${passMsg.type}`}>{passMsg.text}</p>}
      </section>

      {/* SECCIÓN ELIMINAR CUENTA (ZONA PELIGROSA) */}
      <div className="danger-divider"></div>
      <section className="dashboard-section danger-zone">
        <h3 className="danger-title">{t.secDelete_t}</h3>
        <p className="danger-desc">{t.secDelete_d}</p>
        <button onClick={handleDeleteAccount} className="btn-delete-account">
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