import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Swal from 'sweetalert2';
import { Trash2, Edit, Plus, Users, Music, Eye, EyeOff, Activity, MousePointerClick, ExternalLink, FileText } from 'lucide-react';
import AddSongForm from '../components/AddSongForm';
import EditSongForm from '../components/EditSongForm';
import { adminDashboardTranslations } from '../lang/adminDashboardTranslations';

const AdminDashboard = () => {
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState('stats');
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  
  const { lang } = useAuth();
  const t = adminDashboardTranslations[lang];

  useEffect(() => {
    fetchData();
  }, [view]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'playtime': return <Music size={20} />;
      case 'license_view': return <FileText size={20} />;
      case 'catalog_click': return <MousePointerClick size={20} />;
      case 'social_redirect': return <ExternalLink size={20} />;
      default: return <Activity size={20} />;
    }
  };

  const getIconContainerStyle = (type) => {
    const colors = {
      playtime: { bg: '#e8f5e9', color: '#2e7d32' },
      license_view: { bg: '#fff3e0', color: '#ef6c00' },
      catalog_click: { bg: '#e3f2fd', color: '#1565c0' },
      social_redirect: { bg: '#fce4ec', color: '#c2185b' }
    };
    const style = colors[type] || { bg: '#f5f5f5', color: '#616161' };
    return {
      padding: '10px',
      borderRadius: '10px',
      backgroundColor: style.bg,
      color: style.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };
  };

  const filteredSongs = songs.filter(song => 
    song.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const resStats = await api.get('/admin/stats');
      setStats(resStats.data);

      if (view === 'songs') {
        const res = await api.get('/admin/songs/all');
        setSongs(res.data);
      } else if (view === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } else if (view === 'stats') {
        const res = await api.get('/admin/events');
        setEvents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
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

    if (result.isConfirmed) {
        try {
        await api.delete(`/admin/songs/${id}`);
        setSongs(songs.filter(s => s.id !== id));
        Swal.fire(t.confirmedDelete_t, t.confirmedDelete_d, 'success');
        } catch (error) {
        Swal.fire(t.confirmDelete__error_t, t.confirmDelete_error_d, 'error');
        }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    try {
      await api.patch(`/admin/songs/${id}/status`, { status: newStatus });
      setSongs(songs.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert(t.errorChangeStatus);
    }
  };

  const handleUserStatus = async (user, newStatus) => {
    let suspensionTime = null;

    // Si es suspensión, pedimos la fecha antes de enviar
    if (newStatus === 'suspended') {
      const { value: date } = await Swal.fire({
        title: t.suspendDate_t,
        html: '<input type="datetime-local" id="swal-input1" class="swal2-input">',
        focusConfirm: false,
        background: '#181818',
        color: '#fff',
        confirmButtonColor: '#1db954',
        preConfirm: () => {
          return document.getElementById('swal-input1').value;
        }
      });

      if (!date) return; // Cancelado si no hay fecha
      suspensionTime = date;
    }

    // Confirmación final
    const result = await Swal.fire({
      title: `${t.confirmStatusUser_t} ${newStatus}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1db954',
      background: '#181818',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/admin/users/${user.id}/status`, { 
          status: newStatus,
          suspension_time: suspensionTime // Enviamos la fecha al backend
        });
        
        // Actualizamos la lista localmente
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus, suspension_time: suspensionTime } : u));
        Swal.fire(t.confirmedStatusUser_t, t.confirmedStatusUser_d, 'success');
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || t.errorChangeStatusUser, 'error');
      }
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>{t.loading}</p>;

  return (
    <div style={adminContainer}>
      <header style={adminHeader}>
        <h1>{t.title}</h1>
        {/* BOTONES DE PESTAÑA */}
        <button onClick={() => setView('stats')} style={view === 'stats' ? btnNavActive : btnNav}>
          <Activity size={18} /> {t.statsTab}
        </button>
        <button onClick={() => setView('songs')} style={view === 'songs' ? btnNavActive : btnNav}>
          <Music size={18} /> {t.songsTab}
        </button>
        <button onClick={() => setView('users')} style={view === 'users' ? btnNavActive : btnNav}>
          <Users size={18} /> {t.usersTab}
        </button>
      </header>

      {view === 'stats' && (
        <>
        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <Users color="#1db954" size={24} />
            <div>
              <p style={statLabelStyle}>{t.statsTotalUsers}</p>
              <h2 style={statValueStyle}>{stats.overview.total_users}</h2>
            </div>
          </div>

          <div style={statCardStyle}>
            <Music color="#1db954" size={24} />
            <div>
              <p style={statLabelStyle}>{t.statsTotalSongs}</p>
              <h2 style={statValueStyle}>{stats.overview.total_songs}</h2>
            </div>
          </div>

          <div style={statCardStyle}>
            <Activity color="#1db954" size={24} />
            <div>
              <p style={statLabelStyle}>{t.statsTotalReproductions}</p>
              <h2 style={statValueStyle}>{stats.overview.total_reproductions}</h2>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#444' }}>
            {t.statsActivity}
          </h3>
          <div style={eventCountGridStyle}>
            {stats.events_summary.map((ev) => (
              <div key={ev.event_type} style={eventStatCardStyle}>
                <div style={getIconContainerStyle(ev.event_type)}>
                  {getEventIcon(ev.event_type)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={statLabelStyle}>{ev.event_type.replace('_', ' ')}</p>
                  <h2 style={{ ...statValueStyle, fontSize: '1.4rem' }}>{ev.total}</h2>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h3>{lang === 'es' ? 'Top 5 Canciones' : 'Top 5 Songs'}</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {stats.top_songs.map((song, index) => (
              <li key={song.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <span>{index + 1}. {song.name}</span>
                <span style={{ fontWeight: 'bold' }}>{song.reproductions} 🎧</span>
              </li>
            ))}
          </ul>
        </div>
        </>
      )}

      {view === 'songs' && (
        <>
          <div style={{ marginBottom: '20px', textAlign: 'right' }}>
            <button onClick={() => setShowAddForm(!showAddForm)} style={btnPrimary}>
              <Plus size={20} /> {showAddForm ? t.addSongButtonClose : t.addSongButtonOpen}
            </button>
          </div>
          {/* Formulario condicional */}
          {showAddForm && (
            <div style={formWrapper}>
              <AddSongForm 
                allSongs={songs}
                onSongAdded={() => { setShowAddForm(false); fetchData(); }} 
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder={t.songSearchBar}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
            />
          </div>

          {/* Tabla de Gestión */}
          <div style={tableContainer}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadStyle}>
                  <th>{t.songsColumnCover}</th>
                  <th>{t.songsColumnName}</th>
                  <th>{t.songsColumnType}</th>
                  <th>{t.songsColumnCollectionName}</th>
                  <th>{t.songsColumnStatus}</th>
                  <th>{t.songsColumnReproductions}</th>
                  <th>{t.songsColumnActions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSongs.map(song => (
                  <tr key={song.id} style={trStyle}>
                    <td><img src={song.cover_url} style={miniCover} alt="" /></td>
                    <td><strong>{song.name}</strong></td>
                    <td>{song.type.toUpperCase()}</td>
                    <td>{song.collection_name}</td>
                    <td>
                      <span style={song.status === 'active' ? statusActive : statusHidden}>
                        {song.status}
                      </span>
                    </td>
                    <td>{song.reproductions} 🎧</td>
                    <td style={actionsCell}>
                        <button onClick={() => setEditingSong(song)} style={btnAction}>
                            <Edit size={18} color="blue" />
                        </button>  
                        <button onClick={() => toggleStatus(song.id, song.status)} title="Ocultar/Mostrar" style={btnAction}>
                            {song.status === 'active' ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button onClick={() => handleDelete(song.id)} title="Eliminar" style={{...btnAction, color: 'red'}}>
                            <Trash2 size={18} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Panel lateral de edición (Drawer) */}
          {editingSong && (
            <EditSongForm 
              song={editingSong} 
              allSongs={songs}
              onSongUpdated={() => { 
                setEditingSong(null); 
                fetchData(); 
              }} 
              onCancel={() => setEditingSong(null)} 
            />
          )}
        </>
      )} 

      { view === 'users' && (
        <>
        {/* BUSCADOR DE USUARIOS */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder={t.userSearchBar}
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            style={searchInputStyle} // Reutilizamos el estilo del buscador de canciones
          />
        </div>

        {/* TABLA DE USUARIOS */}
        <div style={tableContainer}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadStyle}>
                <th>{t.usersColumnId}</th>
                {/* <th>Nombre</th> */}
                <th>{t.usersColumnEmail}</th>
                <th>{t.usersColumnRole}</th>
                <th>{t.usersColumnStatus}</th>
                <th>{t.usersColumnActions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} style={trStyle}>
                  <td>{u.id}</td>
                  {/* <td><strong>{u.name}</strong></td> */}
                  <td>{u.email}</td>
                  <td>{u.role.toUpperCase()}</td>
                  <td>
                    <span style={u.status === 'active' ? statusActive : statusHidden}>
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {u.role !== 'admin' ? (
                      <select 
                        value={u.status} 
                        onChange={(e) => handleUserStatus(u, e.target.value)}
                        style={selectStyle}
                      >
                        <option value="active">{t.usersActionActive}</option>
                        <option value="suspended">{t.usersActionSuspend}</option>
                        <option value="blocked">{t.usersActionBlock}</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#999' }}>{t.usersAdmin}</span>
                    )}
                  </td>
                  <td>
                    <span style={u.status === 'active' ? statusActive : statusHidden}>
                      {u.status.toUpperCase()}
                    </span>
                    {u.status === 'suspended' && u.suspension_time && (
                      <div style={{ fontSize: '0.7rem', color: '#888' }}>
                        Hasta: {new Date(u.suspension_time).toLocaleString()}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
};

// --- ESTILOS ---
const adminContainer = { padding: '40px', maxWidth: '1200px', margin: '0 auto' };
const adminHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const btnPrimary = { background: '#1db954', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' };
const tableContainer = { background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const theadStyle = { background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee' };
const trStyle = { borderBottom: '1px solid #eee' };
const miniCover = { width: '45px', height: '45px', borderRadius: '4px', objectFit: 'cover' };
const actionsCell = { display: 'flex', gap: '10px' };
const btnAction = { background: 'none', border: 'none', cursor: 'pointer', color: '#555' };
const statusActive = { color: '#1db954', fontWeight: 'bold', fontSize: '0.8rem' };
const statusHidden = { color: '#999', fontWeight: 'bold', fontSize: '0.8rem' };
const formWrapper = { marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '12px', background: '#fdfdfd' };

const btnNav = {
  background: '#282828',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: '0.3s'
};

const btnNavActive = {
  ...btnNav,
  background: '#1db954',
  fontWeight: 'bold'
};

const selectStyle = {
  padding: '5px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  cursor: 'pointer'
};

const searchInputStyle = {
  width: '100%',
  padding: '12px 20px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '1rem',
  outline: 'none',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  boxSizing: 'border-box'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginBottom: '40px'
};

const statCardStyle = {
  background: '#fff',
  padding: '20px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  border: '1px solid #eee'
};

const statLabelStyle = {
  margin: 0,
  fontSize: '0.85rem',
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const statValueStyle = {
  margin: 0,
  fontSize: '1.8rem',
  color: '#121212'
};

const eventCountGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '15px'
};

const eventStatCardStyle = {
  background: '#fff',
  padding: '15px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  border: '1px solid #f0f0f0'
};

const cardStyle = {
  background: '#fff',
  padding: '25px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  border: '1px solid #eee',
  marginTop: '20px'
};

export default AdminDashboard;