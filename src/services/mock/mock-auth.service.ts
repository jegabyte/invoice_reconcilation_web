import { User } from '@/types/models';
import { MOCK_USERS } from './mock-data';
import { Timestamp } from 'firebase/firestore';

export interface SignInData {
    email: string;
    password: string;
}

export interface SignUpData {
    email: string;
    password: string;
    displayName: string;
}

export class MockAuthService {
    private static currentUser: User | null = null;
    private static authStateListeners: ((user: User | null) => void)[] = [];

    static async signIn(data: SignInData): Promise<User> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockUser = MOCK_USERS[data.email];
        if (!mockUser || mockUser.password !== data.password) {
            throw new Error('Invalid email or password');
        }

        this.currentUser = { ...mockUser.user };
        this.notifyAuthStateListeners();
        
        // Store in localStorage for persistence
        localStorage.setItem('mockAuthUser', JSON.stringify(this.currentUser));
        
        return this.currentUser;
    }

    static async signUp(data: SignUpData): Promise<User> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (MOCK_USERS[data.email]) {
            throw new Error('User already exists');
        }

        const newUser: User = {
            id: Date.now().toString(),
            email: data.email,
            displayName: data.displayName,
            role: 'VIEWER',
            permissions: {
                invoices: { create: false, read: true, update: false, delete: false, approve: false },
                rules: { create: false, read: true, update: false, delete: false },
                vendors: { create: false, read: true, update: false, delete: false },
                disputes: { create: false, read: true, update: false, delete: false, resolve: false },
                reports: { view: true, export: false, schedule: false },
                system: { configureSettings: false, manageUsers: false, viewAuditLogs: false }
            },
            preferences: {
                theme: 'light',
                language: 'en',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                numberFormat: 'en-US',
                notifications: {
                    email: { enabled: true, frequency: 'DAILY', types: [] },
                    inApp: { enabled: true, types: [] }
                },
                dashboard: { defaultView: 'overview', widgets: [] }
            },
            activity: {
                lastLogin: Timestamp.now(),
                lastActivity: Timestamp.now(),
                loginCount: 1,
                recentActions: []
            },
            metadata: {
                createdAt: Timestamp.now(),
                lastModified: Timestamp.now(),
                isActive: true
            }
        };

        MOCK_USERS[data.email] = {
            password: data.password,
            user: newUser
        };

        this.currentUser = newUser;
        this.notifyAuthStateListeners();
        localStorage.setItem('mockAuthUser', JSON.stringify(this.currentUser));
        
        return newUser;
    }

    static async signOut(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        this.currentUser = null;
        this.notifyAuthStateListeners();
        localStorage.removeItem('mockAuthUser');
    }

    static async resetPassword(email: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!MOCK_USERS[email]) {
            throw new Error('User not found');
        }
        
        console.log(`Password reset email sent to ${email}`);
    }

    static async updatePassword(_currentPassword: string, _newPassword: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }
        
        console.log('Password updated successfully');
    }

    static async updateProfile(updates: Partial<User>): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        this.currentUser = { ...this.currentUser, ...updates };
        this.notifyAuthStateListeners();
        localStorage.setItem('mockAuthUser', JSON.stringify(this.currentUser));
    }

    static async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!this.currentUser || this.currentUser.id !== userId) {
            throw new Error('Cannot update other user profiles');
        }

        await this.updateProfile(updates);
    }

    static async sendPasswordResetEmail(email: string): Promise<void> {
        return this.resetPassword(email);
    }

    static getCurrentUser(): User | null {
        if (!this.currentUser) {
            // Try to restore from localStorage
            const stored = localStorage.getItem('mockAuthUser');
            if (stored) {
                try {
                    this.currentUser = JSON.parse(stored);
                } catch (e) {
                    console.error('Failed to parse stored user', e);
                }
            }
        }
        return this.currentUser;
    }

    static subscribeToAuthState(callback: (user: User | null) => void): () => void {
        this.authStateListeners.push(callback);
        
        // Immediately call with current state
        callback(this.getCurrentUser());
        
        // Return unsubscribe function
        return () => {
            this.authStateListeners = this.authStateListeners.filter(listener => listener !== callback);
        };
    }

    private static notifyAuthStateListeners(): void {
        this.authStateListeners.forEach(listener => listener(this.currentUser));
    }

    static hasPermission(permission: string, action: string): boolean {
        if (!this.currentUser) return false;
        
        const permissions = this.currentUser.permissions as any;
        return permissions[permission]?.[action] || false;
    }

    static canAccessVendor(vendorId: string): boolean {
        if (!this.currentUser) return false;
        
        // Admin and Manager can access all vendors
        if (['ADMIN', 'MANAGER'].includes(this.currentUser.role)) {
            return true;
        }
        
        // Check vendor-specific access
        if (this.currentUser.vendorAccess?.restrictToVendor) {
            return this.currentUser.vendorAccess.vendorIds.includes(vendorId);
        }
        
        return true;
    }
}