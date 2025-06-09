import { User } from '@/types/models';

export interface SignInData {
    email: string;
    password: string;
}

export interface SignUpData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
}

export interface IAuthService {
    signIn(data: SignInData): Promise<User>;
    signUp(data: SignUpData): Promise<User>;
    signOut(): Promise<void>;
    resetPassword(email: string): Promise<void>;
    updatePassword(currentPassword: string, newPassword: string): Promise<void>;
    updateProfile(updates: Partial<User>): Promise<void>;
    getCurrentUser(): User | null;
    subscribeToAuthState(callback: (user: User | null) => void): () => void;
    hasPermission(resource: string, action: string): boolean;
    canAccessVendor(vendorId: string): boolean;
}