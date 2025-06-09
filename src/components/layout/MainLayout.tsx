import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    Menu,
    X,
    FileText,
    Building2,
    Zap,
    Settings,
    Bell,
    LogOut,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatInitials } from '@/utils/formatters';
import { APP_NAME } from '@/config/constants';

export function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const navigation = [
        { name: 'Invoices', href: '/invoices', icon: FileText },
        { name: 'Partners', href: '/vendors', icon: Building2 },
        { name: 'Rules', href: '/rules', icon: Zap },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <span className="text-2xl mr-3">📊</span>
                        <span className="text-lg font-semibold text-gray-900">{APP_NAME}</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="mt-5 px-2">
                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                    {item.name}
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                            >
                                <Menu className="h-6 w-6" />
                            </button>

                            <div className="flex-1" />

                            <div className="flex items-center space-x-4">
                                {/* Notifications */}
                                <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                                    <Bell className="h-5 w-5 text-gray-600" />
                                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                                </button>

                                {/* User menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                                            {formatInitials(user?.displayName || 'User')}
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-medium text-gray-700">
                                                {user?.displayName}
                                            </p>
                                            <p className="text-xs text-gray-500">{user?.role}</p>
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </button>

                                    {userMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            navigate('/settings');
                                                            setUserMenuOpen(false);
                                                        }}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Settings className="h-4 w-4 mr-3" />
                                                        Settings
                                                    </button>
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <LogOut className="h-4 w-4 mr-3" />
                                                        Sign out
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
