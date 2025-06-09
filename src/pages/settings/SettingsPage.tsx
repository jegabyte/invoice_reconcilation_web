import { useState } from 'react';
import { Save, Bell, Shield, Database } from 'lucide-react';
import { Card } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
        notifications: {
            emailEnabled: true,
            inAppEnabled: true,
            frequency: 'DAILY',
            types: ['invoice_received', 'validation_complete', 'disputes']
        },
        preferences: {
            theme: 'light',
            language: 'en',
            timezone: 'UTC',
            dateFormat: 'MM/DD/YYYY'
        },
        system: {
            autoProcessing: true,
            defaultValidationRules: true,
            duplicateCheckDays: 30,
            retentionDays: 365
        }
    });

    const tabs = [
        { id: 'general', label: 'General', icon: Database },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'system', label: 'System', icon: Database }
    ];

    const handleSave = () => {
        alert('Settings saved successfully!');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Display Name</label>
                            <input
                                type="text"
                                value={settings.displayName}
                                onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={settings.email}
                                disabled
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Language</label>
                            <select
                                value={settings.preferences.language}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    preferences: { ...settings.preferences, language: e.target.value }
                                })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Timezone</label>
                            <select
                                value={settings.preferences.timezone}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    preferences: { ...settings.preferences, timezone: e.target.value }
                                })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                                <option value="UTC">UTC</option>
                                <option value="EST">Eastern Time</option>
                                <option value="CST">Central Time</option>
                                <option value="PST">Pacific Time</option>
                            </select>
                        </div>
                    </div>
                );
                
            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.emailEnabled}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: { ...settings.notifications, emailEnabled: e.target.checked }
                                    })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
                            </label>
                        </div>
                        
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.inAppEnabled}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: { ...settings.notifications, inAppEnabled: e.target.checked }
                                    })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">In-App Notifications</span>
                            </label>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notification Frequency</label>
                            <select
                                value={settings.notifications.frequency}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    notifications: { ...settings.notifications, frequency: e.target.value }
                                })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                                <option value="IMMEDIATE">Immediate</option>
                                <option value="DAILY">Daily Digest</option>
                                <option value="WEEKLY">Weekly Summary</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notification Types</label>
                            <div className="space-y-2">
                                {['invoice_received', 'validation_complete', 'disputes'].map((type) => (
                                    <label key={type} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications.types.includes(type)}
                                            onChange={(e) => {
                                                const types = e.target.checked
                                                    ? [...settings.notifications.types, type]
                                                    : settings.notifications.types.filter(t => t !== type);
                                                setSettings({
                                                    ...settings,
                                                    notifications: { ...settings.notifications, types }
                                                });
                                            }}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );
                
            case 'security':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Change Password
                            </button>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Add an extra layer of security to your account
                            </p>
                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Enable 2FA
                            </button>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Sessions</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Manage your active sessions and sign out from other devices
                            </p>
                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                View Active Sessions
                            </button>
                        </div>
                    </div>
                );
                
            case 'system':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.system.autoProcessing}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        system: { ...settings.system, autoProcessing: e.target.checked }
                                    })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Enable Automatic Processing</span>
                            </label>
                            <p className="mt-1 text-xs text-gray-500 ml-6">
                                Automatically process invoices as they are received
                            </p>
                        </div>
                        
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.system.defaultValidationRules}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        system: { ...settings.system, defaultValidationRules: e.target.checked }
                                    })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Use Default Validation Rules</span>
                            </label>
                            <p className="mt-1 text-xs text-gray-500 ml-6">
                                Apply system default rules when vendor-specific rules are not available
                            </p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Duplicate Check Period (days)</label>
                            <input
                                type="number"
                                value={settings.system.duplicateCheckDays}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    system: { ...settings.system, duplicateCheckDays: parseInt(e.target.value) }
                                })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data Retention Period (days)</label>
                            <input
                                type="number"
                                value={settings.system.retentionDays}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    system: { ...settings.system, retentionDays: parseInt(e.target.value) }
                                })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                        </div>
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="flex space-x-8">
                <div className="w-64">
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                        activeTab === tab.id
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex-1">
                    <Card>
                        <div className="px-6 py-4">
                            {renderContent()}
                        </div>
                        
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={handleSave}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}