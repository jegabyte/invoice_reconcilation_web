import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/common';

export function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
