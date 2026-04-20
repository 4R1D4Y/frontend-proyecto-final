import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();

    // Mientras se comprueba si el usuario existe, no mostramos nada o un cargando
    if (loading) return <p style={{ padding: '20px', color: 'white' }}>Verificando acceso...</p>;

    // Si no hay usuario logueado, al login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Si la ruta es solo para admin y el usuario no lo es, al home
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    // Si todo está ok, mostramos el contenido (children)
    return children;
};

export default ProtectedRoute;
