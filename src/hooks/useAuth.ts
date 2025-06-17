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
        // Check for existing Google OAuth token on mount
        const token = localStorage.getItem('googleAccessToken');
        if (token && !auth.isAuthenticated) {
            // Validate the token with Google
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Invalid token');
                }
            })
            .then(userInfo => {
                const user = {
                    id: userInfo.sub,
                    email: userInfo.email,
                    name: userInfo.name || userInfo.email.split('@')[0],
                    picture: userInfo.picture,
                    role: 'admin' as const,
                    accessToken: token
                };
                dispatch(loginSuccess(user));
            })
            .catch(() => {
                // Token is invalid, remove it
                localStorage.removeItem('googleAccessToken');
            });
        }
    }, [dispatch, auth.isAuthenticated]);

    const signOut = () => {
        // Clear Google OAuth token
        localStorage.removeItem('googleAccessToken');
        // Clear old auth token if it exists
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