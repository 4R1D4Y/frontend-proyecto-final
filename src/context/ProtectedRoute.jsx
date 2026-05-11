import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente ProtectedRoute (Higher-Order Component)
 * 
 * Este componente actúa como un middleware en el lado del cliente (Frontend).
 * Su función es interceptar el acceso a rutas privadas, validando tanto la 
 * existencia de una sesión activa como los permisos de rol específicos.
 * 
 * @param {ReactNode} children - El componente o página que se desea renderizar.
 * @param {boolean} adminOnly - Flag que indica si la ruta requiere privilegios de administrador.
 */

const ProtectedRoute = ({ children, adminOnly = false }) => {
    // Acceso al estado global de autenticación
    const { user, loading } = useAuth();

    /**
     * Gestión del estado de carga:
     * Durante la verificación del token (hidratación del estado), evitamos 
     * redirecciones en falso mostrando un indicador de carga.
     */
    if (loading) return <p style={{ padding: '20px', color: 'white' }}>Verificando acceso...</p>;

    /**
     * Barrera de Autenticación:
     * Si el contexto confirma que no hay un usuario autenticado, se utiliza el 
     * componente 'Navigate' para redirigir forzosamente al flujo de Login.
     */
    if (!user) {
        return <Navigate to="/login" />;
    }

    /**
     * Barrera de Autorización (RBAC):
     * Si la ruta está marcada como exclusiva para administradores ('adminOnly')
     * y el rol del usuario no coincide, se deniega el acceso redirigiendo al Home.
     */
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    /**
     * Acceso Concedido:
     * Si se superan todas las validaciones de seguridad, se renderizan los 
     * componentes hijos (children) permitiendo el acceso a la vista privada.
     */
    return children;
};

export default ProtectedRoute;
