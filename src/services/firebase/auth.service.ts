import { IAuthService, SignInData, SignUpData } from '@/services/interfaces/auth.interface';
import { User } from '@/types/models';

export class FirebaseAuthService implements IAuthService {
    async signIn(_data: SignInData): Promise<User> {
        // TODO: Implement Firebase auth
        throw new Error('Firebase auth not implemented');
    }

    async signUp(_data: SignUpData): Promise<User> {
        throw new Error('Firebase auth not implemented');
    }

    async signOut(): Promise<void> {
        throw new Error('Firebase auth not implemented');
    }

    async resetPassword(_email: string): Promise<void> {
        throw new Error('Firebase auth not implemented');
    }

    async updatePassword(_currentPassword: string, _newPassword: string): Promise<void> {
        throw new Error('Firebase auth not implemented');
    }

    async updateProfile(_updates: Partial<User>): Promise<void> {
        throw new Error('Firebase auth not implemented');
    }

    getCurrentUser(): User | null {
        throw new Error('Firebase auth not implemented');
    }

    subscribeToAuthState(_callback: (user: User | null) => void): () => void {
        throw new Error('Firebase auth not implemented');
    }

    hasPermission(_resource: string, _action: string): boolean {
        throw new Error('Firebase auth not implemented');
    }

    canAccessVendor(_vendorId: string): boolean {
        throw new Error('Firebase auth not implemented');
    }
}