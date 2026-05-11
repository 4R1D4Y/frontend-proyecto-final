import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Swal from 'sweetalert2';
import { Trash2, Clock, Edit, Plus, Users, Music, Eye, EyeOff, Activity, MousePointerClick, ExternalLink, FileText } from 'lucide-react';
import AddSongForm from '../components/AddSongForm';
import EditSongForm from '../components/EditSongForm';
import { adminDashboardTranslations } from '../lang/adminDashboardTranslations';
import "../styles/adminDashboard.css";

/**
 * Componente AdminDashboard
 * 
 * Núcleo administrativo de la plataforma. Gestiona tres áreas críticas:
 * 1. Estadísticas y Telemetría: Visualización de eventos en tiempo real.
 * 2. Gestión de Catálogo: CRUD completo de canciones y colecciones.
 * 3. Gestión de Usuarios: Control de acceso, suspensiones y bloqueos.
 */

const AdminDashboard = () => {
  // Estados para el almacenamiento de datos procedentes de la API
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState('stats'); // Control de la vista activa (tabs)
  const [loading, setLoading] = useState(true);

  // Estados para modales, edición y filtrado
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);

  // Lógica de paginación del lado del cliente para optimizar el rendimiento de la UI
  const [currentPageSongs, setCurrentPageSongs] = useState(1);
  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  const itemsPerPage = 10;
  
  const { lang } = useAuth();
  const t = adminDashboardTranslations[lang];

  // Efecto para refrescar los datos automáticamente al cambiar de pestaña
  useEffect(() => {
    fetchData();
  }, [view]);

  /**
   * Identificación visual de telemetría:
   * Asigna iconos y estilos dinámicos a los eventos de usuario (reproducciones, clics, etc.)
   * para facilitar la lectura rápida de la actividad en la plataforma.
   */
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

  /**
   * Lógica de Filtrado y Paginación:
   * Se aplican filtros de búsqueda en tiempo real sobre los arrays de datos
   * y se calculan los índices para la segmentación de páginas.
   */
   // Para Canciones
  const filteredSongs = songs.filter(song => 
    song.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const lastIndexSongs = currentPageSongs * itemsPerPage;
  const firstIndexSongs = lastIndexSongs - itemsPerPage;
  const currentSongs = filteredSongs.slice(firstIndexSongs, lastIndexSongs);

  // Para Usuarios
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchUser.toLowerCase())
  );
  const lastIndexUsers = currentPageUsers * itemsPerPage;
  const firstIndexUsers = lastIndexUsers - itemsPerPage;
  const currentUsers = filteredUsers.slice(firstIndexUsers, lastIndexUsers);

  /**
   * Subcomponente de Paginación:
   * Abstracción funcional para la navegación entre bloques de datos,
   * facilitando la reutilización tanto en la lista de canciones como en la de usuarios.
   */
   const Pagination = ({ current, total, paginate }) => {
    const totalPages = Math.ceil(total / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="admin-pagination">
        <button 
          disabled={current === 1} 
          onClick={() => paginate(current - 1)}
          className="pagination-btn"
        >
          &larr; {lang === 'es' ? 'Anterior' : 'Previous'}
        </button>
        <span className="pagination-info">
          {lang === 'es' ? 'Página' : 'Page'} {current} {lang === 'es' ? 'de' : 'of'} {totalPages}
        </span>
        <button 
          disabled={current === totalPages} 
          onClick={() => paginate(current + 1)}
          className="pagination-btn"
        >
          {lang === 'es' ? 'Siguiente' : 'Next'} &rarr;
        </button>
      </div>
    );
   };

  /**
   * Sincronización con el Backend:
   * Realiza peticiones asíncronas agrupadas para obtener métricas generales
   * y datos específicos según la vista seleccionada por el administrador.
   */
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
      console.error("Error en la carga de administración:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Operaciones CRUD: Eliminación de recursos.
   * Implementa confirmación mediante SweetAlert2 antes de disparar la petición DELETE
   * a la API de Laravel para evitar pérdidas accidentales de datos.
   */
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
        setSongs(songs.filter(s => s.id !== id)); // Actualización optimista de la UI
        Swal.fire(t.confirmedDelete_t, t.confirmedDelete_d, 'success');
        } catch (error) {
        Swal.fire(t.confirmDelete__error_t, t.confirmDelete_error_d, 'error');
        }
    }
  };

  /**
   * Gestión de Visibilidad del Catálogo:
   * Permite alternar entre estados 'active' y 'hidden' mediante el método PATCH,
   * permitiendo al admin retirar canciones del catálogo público sin eliminarlas.
   */
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    try {
      await api.patch(`/admin/songs/${id}/status`, { status: newStatus });
      setSongs(songs.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert(t.errorChangeStatus);
    }
  };

  /**
   * Control de Seguridad de Usuarios:
   * Implementa una lógica avanzada de moderación. En caso de 'suspensión',
   * se solicita una fecha y hora de desbloqueo mediante un modal con input nativo.
   */
  const handleUserStatus = async (user, newStatus) => {
    let suspensionTime = null;

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
      if (!date) return;
      suspensionTime = date;
    }

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
          suspension_time: suspensionTime 
        });
        
        // Sincronización del estado local con el backend
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus, suspension_time: suspensionTime } : u));
        Swal.fire(t.confirmedStatusUser_t, t.confirmedStatusUser_d, 'success');
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || t.errorChangeStatusUser, 'error');
      }
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>{t.loading}</p>;


  return (
    <div className="admin-container">
      {/* HEADER SEGÚN FIGMA: TÍTULO IZQUIERDA + TABS AL LADO */}
      <header className="admin-header">
        <h2 className="page-title">{t.title}</h2>
        <nav className="admin-tabs">
          <button className={`tab-btn ${view === 'stats' ? 'active' : ''}`} onClick={() => setView('stats')}>
            <Activity size={18} /> {t.statsTab}
          </button>
          <button className={`tab-btn ${view === 'songs' ? 'active' : ''}`} onClick={() => setView('songs')}>
            <Music size={18} /> {t.songsTab}
          </button>
          <button className={`tab-btn ${view === 'users' ? 'active' : ''}`} onClick={() => setView('users')}>
            <Users size={18} /> {t.usersTab}
          </button>
        </nav>
      </header>

      {/* --- VISTA ESTADÍSTICAS --- */}
      {view === 'stats' && stats && (
        <div className="stats-view">
          {/* TARJETAS PRINCIPALES */}
          <div className="stats-grid">
            <div className="stat-card">
              <Users className="stat-icon blue" />
              <div className="stat-info">
                <p>{t.statsTotalUsers}</p>
                <h3>{stats.overview.total_users}</h3>
              </div>
            </div>
            <div className="stat-card">
              <Music className="stat-icon green" />
              <div className="stat-info">
                <p>{t.statsTotalSongs}</p>
                <h3>{stats.overview.total_songs}</h3>
              </div>
            </div>
            <div className="stat-card">
              <Activity className="stat-icon purple" />
              <div className="stat-info">
                <p>{t.statsTotalReproductions}</p>
                <h3>{stats.overview.total_reproductions}</h3>
              </div>
            </div>
            <div className="stat-card">
              <Clock className="stat-icon orange" />
              <div className="stat-info">
                <p>{t.statsTotalTime}</p>
                <h3>
                  {Math.floor(stats.overview.total_listen_time / 3600)}h {Math.floor((stats.overview.total_listen_time % 3600) / 60)}m
                </h3>
              </div>
            </div>
          </div>

          {/* DISTRIBUCIÓN DE ACTIVIDAD DETALLADA */}
          <h3 className="admin-section-title">{t.statsActivity}</h3>
          <div className="events-grid">
            {stats.events_summary.map((ev) => (
              <div key={ev.event_type} className="event-mini-card">
                <div style={getIconContainerStyle(ev.event_type)}>
                  {getEventIcon(ev.event_type)}
                </div>
                <div className="event-mini-info">
                  <p>{ev.event_type.replace('_', ' ').toUpperCase()}</p>
                  <strong>{ev.total}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* TOP 5 CANCIONES */}
          <div className="top-songs-card">
            <h3>{lang === 'es' ? 'Canciones más escuchadas' : 'Most Played Songs'}</h3>
            <div className="top-list">
              {stats.top_songs.map((song, index) => (
                <div key={song.id} className="top-item">
                  <span className="top-rank">#{index + 1}</span>
                  <span className="top-name">{song.name}</span>
                  <span className="top-value">{song.reproductions} 🎧</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'songs' && (
        <div className="admin-songs-view">
          {/* BARRA DE ACCIONES SUPERIOR */}
          <div className="admin-actions-bar">
            <div className="search-wrapper">
              <MousePointerClick size={18} className="search-icon" />
              <input
                type="text"
                placeholder={t.songSearchBar}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn-add-song">
              {showAddForm ? <><EyeOff size={18} /> {t.addSongButtonClose}</> : <><Plus size={18} /> {t.addSongButtonOpen}</>}
            </button>
          </div>

          {/* FORMULARIO DE ADICIÓN (DROPDOWN) */}
          {showAddForm && (
            <div className="admin-form-container">
              <AddSongForm 
                allSongs={songs}
                onSongAdded={() => { setShowAddForm(false); fetchData(); }} 
              />
            </div>
          )}

          {/* TABLA DE CANCIONES ESTILO FIGMA */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
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
                {currentSongs.map(song => (
                  <tr key={song.id}>
                    <td><img src={song.cover_url} className="admin-mini-cover" alt="" /></td>
                    <td><span className="song-name-cell">{song.name}</span></td>
                    <td><span className="badge-type">{song.type}</span></td>
                    <td><span className="collection-name-cell">{song.collection_name || '—'}</span></td>
                    <td>
                      <span className={`badge-status ${song.status}`}>
                        {song.status}
                      </span>
                    </td>
                    <td><span className="repro-count">{song.reproductions.toLocaleString()} 🎧</span></td>
                    <td>
                      <div className="admin-actions-btns">
                        <button onClick={() => setEditingSong(song)} className="btn-action edit" title={t.edit}>
                          <Edit size={18} />
                        </button>  
                        <button onClick={() => toggleStatus(song.id, song.status)} className="btn-action toggle" title="Ocultar/Mostrar">
                          {song.status === 'active' ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button onClick={() => handleDelete(song.id)} className="btn-action delete" title={t.delete}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination 
            current={currentPageSongs} 
            total={filteredSongs.length} 
            paginate={setCurrentPageSongs} 
          />


          {/* Panel lateral de edición (Drawer) */}
          {editingSong && (
            <EditSongForm 
              song={editingSong} 
              allSongs={songs}
              onSongUpdated={() => { setEditingSong(null); fetchData(); }} 
              onCancel={() => setEditingSong(null)} 
            />
          )}
        </div>
      )} 

      {view === 'users' && (
        <div className="admin-users-view">
          {/* BUSCADOR DE USUARIOS */}
          <div className="admin-actions-bar">
            <div className="search-wrapper">
              <Users size={18} className="search-icon" />
              <input
                type="text"
                placeholder={t.userSearchBar}
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>

          {/* TABLA DE USUARIOS ESTILO FIGMA */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t.usersColumnId}</th>
                  <th>{t.usersColumnEmail}</th>
                  <th>{t.usersColumnRole}</th>
                  <th>{t.usersColumnStatus}</th>
                  <th>{t.usersColumnActions}</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map(u => (
                  <tr key={u.id}>
                    <td><span className="user-id-cell">#{u.id}</span></td>
                    <td><span className="user-email-cell">{u.email}</span></td>
                    <td><span className="badge-type">{u.role}</span></td>
                    <td>
                      <div className="status-cell-wrapper">
                        <span className={`badge-status ${u.status}`}>
                          {u.status.toUpperCase()}
                        </span>
                        {u.status === 'suspended' && u.suspension_time && (
                          <p className="suspension-date">
                            {new Date(u.suspension_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      {u.role !== 'admin' ? (
                        <select 
                          value={u.status} 
                          onChange={(e) => handleUserStatus(u, e.target.value)}
                          className="admin-status-select"
                        >
                          <option value="active">{t.usersActionActive}</option>
                          <option value="suspended">{t.usersActionSuspend}</option>
                          <option value="blocked">{t.usersActionBlock}</option>
                        </select>
                      ) : (
                        <span className="admin-badge-protected">{t.usersAdmin}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination 
            current={currentPageUsers} 
            total={filteredUsers.length} 
            paginate={setCurrentPageUsers} 
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;