import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
    Menu,
    X,
    FileText,
    Building2,
    Zap,
    Settings,
    Bell,
    LogOut
} from 'lucide-react';
import { APP_NAME } from '@/config/constants';
import { useAuth } from '@/hooks/useAuth';

export function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, signOut } = useAuth();

    const navigation = [
        { name: 'Invoices', href: '/invoices', icon: FileText },
        { name: 'Vendors', href: '/vendors', icon: Building2 },
        { name: 'Rules', href: '/rules', icon: Zap },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

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
            <div
                className={`${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <img 
                                src="https://images.squarespace-cdn.com/content/v1/5a5dbe4632601eb31977f947/1724050307112-W8G9KOZ3F7LQBY48NSWI/logo_AirAsiaMOVE.png"
                                alt="AirAsia MOVE"
                                className="h-8 w-auto"
                            />
                            <span className="text-sm font-medium text-gray-700 hidden lg:block">
                                {APP_NAME}
                            </span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
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
                    </nav>
                </div>
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

                                {/* User Info */}
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-3 p-2">
                                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                                            {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-medium text-gray-700">
                                                {user?.name || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Logout Button */}
                                    <button
                                        onClick={signOut}
                                        className="p-2 rounded-lg hover:bg-gray-100"
                                        title="Sign out"
                                    >
                                        <LogOut className="h-5 w-5 text-gray-600" />
                                    </button>
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