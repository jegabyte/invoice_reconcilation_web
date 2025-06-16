import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { loginSuccess, logout } from '@/store/slices/auth.slice';

export function useAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        // Check for existing auth token on mount
        const token = localStorage.getItem('authToken');
        if (token && !auth.isAuthenticated) {
            // In a real app, validate the token with the backend
            // For now, we'll create a mock user
            const mockUser = {
                id: '1',
                email: 'admin@example.com',
                name: 'Admin',
                role: 'admin' as const
            };
            dispatch(loginSuccess(mockUser));
        }
    }, [dispatch, auth.isAuthenticated]);

    const signOut = () => {
        localStorage.removeItem('authToken');
        dispatch(logout());
        navigate('/login');
    };

    return {
        user: auth.user,
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        error: auth.error,
        signOut
    };
}