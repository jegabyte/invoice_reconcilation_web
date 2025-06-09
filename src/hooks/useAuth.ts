import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User } from '@/types/models';
import { MockAuthService as AuthService, SignInData, SignUpData } from '@/services/mock/mock-auth.service';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signIn: (data: SignInData) => Promise<void>;
    signUp: (data: SignUpData) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    hasPermission: (resource: string, action: string) => boolean;
    canAccessVendor: (vendorId: string) => boolean;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = AuthService.subscribeToAuthState((userData: User | null) => {
            setUser(userData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (data: SignInData) => {
        try {
            setError(null);
            setLoading(true);
            const userData = await AuthService.signIn(data);
            setUser(userData);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (data: SignUpData) => {
        try {
            setError(null);
            setLoading(true);
            const userData = await AuthService.signUp(data);
            setUser(userData);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setLoading(true);
            await AuthService.signOut();
            setUser(null);
            navigate('/login');
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        try {
            setError(null);
            await AuthService.sendPasswordResetEmail(email);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updatePassword = async (newPassword: string) => {
        try {
            setError(null);
            await AuthService.updatePassword('', newPassword);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) return;

        try {
            setError(null);
            await AuthService.updateUserProfile(user.id, updates);
            setUser({ ...user, ...updates });
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const hasPermission = (resource: string, action: string): boolean => {
        if (!user) return false;
        return AuthService.hasPermission(resource, action);
    };

    const canAccessVendor = (vendorId: string): boolean => {
        if (!user) return false;
        return AuthService.canAccessVendor(vendorId);
    };

    const clearError = () => setError(null);

    const value: AuthContextType = {
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        hasPermission,
        canAccessVendor,
        clearError
    };

    return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// ==========================================
// PERMISSION HOOKS
// ==========================================

export function usePermission(resource: string, action: string): boolean {
    const { user } = useAuth();
    if (!user) return false;
    return AuthService.hasPermission(resource, action);
}

export function useVendorAccess(vendorId: string): boolean {
    const { user } = useAuth();
    if (!user) return false;
    return AuthService.canAccessVendor(vendorId);
}

export function useRequireAuth() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    return { user, loading };
}

export function useRequirePermission(resource: string, action: string) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const hasPermission = usePermission(resource, action);

    useEffect(() => {
        if (user && !hasPermission) {
            navigate('/unauthorized');
        }
    }, [user, hasPermission, navigate]);

    return hasPermission;
}
