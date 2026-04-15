import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Swal from 'sweetalert2';
import { Trash2, Edit, Plus, Users, Music, Eye, EyeOff } from 'lucide-react';
import AddSongForm from '../components/AddSongForm';
import EditSongForm from '../components/EditSongForm';
import { adminDashboardTranslations } from '../lang/adminDashboardTranslations';

const AdminDashboard = () => {
  const [songs, setSongs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editingSong, setEditingSong] = useState(null);
  
  const { lang } = useAuth();
  const t = adminDashboardTranslations[lang];

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const res = await api.get('/admin/songs/all');
      setSongs(res.data);
    } catch (err) {
      console.error("Error al cargar canciones", err);
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

  if (loading) return <p style={{ padding: '20px' }}>{t.loading}</p>;

  return (
    <div style={adminContainer}>
      <header style={adminHeader}>
        <h1>{t.title}</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} style={btnPrimary}>
          <Plus size={20} /> {showAddForm ? t.addSongButtonClose : t.addSongButtonOpen}
        </button>
      </header>

      {/* Formulario condicional */}
      {showAddForm && (
        <div style={formWrapper}>
          <AddSongForm 
            allSongs={songs}
            onSongAdded={() => { setShowAddForm(false); fetchSongs(); }} 
          />
        </div>
      )}

      {/* Tabla de Gestión */}
      <div style={tableContainer}>
        <table style={tableStyle}>
          <thead>
            <tr style={theadStyle}>
              <th>{t.columnCover}</th>
              <th>{t.columnName}</th>
              <th>{t.columnType}</th>
              <th>{t.columnStatus}</th>
              <th>{t.columnReproductions}</th>
              <th>{t.columnActions}</th>
            </tr>
          </thead>
          <tbody>
            {songs.map(song => (
              <tr key={song.id} style={trStyle}>
                <td><img src={song.cover_url} style={miniCover} alt="" /></td>
                <td><strong>{song.name}</strong></td>
                <td>{song.type.toUpperCase()}</td>
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
            fetchSongs(); 
          }} 
          onCancel={() => setEditingSong(null)} 
        />
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

export default AdminDashboard;