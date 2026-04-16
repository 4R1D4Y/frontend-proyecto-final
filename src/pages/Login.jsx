import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { loginTranslations } from '../lang/loginTranslations';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const { login, lang } = useAuth();
  const navigate = useNavigate();
  const t = loginTranslations[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate('/'); // Si sale bien, nos manda a la Home
    } catch (err) {
      if (err.response?.status === 403) {
        const { status, until, message } = err.response.data;
        Swal.fire({
            title: status === 'suspended' ? t.accountSuspended : t.accountBlocked,
            html: `
                <p>${ status === 'suspended' ? t.accountSuspended_message : t.accountBlocked_message}</p>
                ${until ? `<p><strong>${t.accountAvailable}</strong> ${until}</p>` : ''}
                <p style="font-size: 0.8rem; color: #888; margin-top: 15px;">
                    ${t.appeal}
                </p>
            `,
            icon: 'error',
            background: '#181818',
            color: '#fff',
            confirmButtonColor: '#1db954'
        });
    } else {
        setError(err.response?.data?.message || t.error);
    }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>{t.title}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>{t.email}</label><br />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>{t.password}</label><br />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">{t.enter}</button>
      </form>
    </div>
  );
};

export default Login;