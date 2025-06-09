import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { getStatusColor } from '@/utils/formatters';

// ==========================================
// LOADING COMPONENTS
// ==========================================

export function LoadingSpinner({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
    const sizeClasses = {
        small: 'h-4 w-4',
        default: 'h-8 w-8',
        large: 'h-12 w-12'
    };

    return (
        <div className="flex items-center justify-center p-4">
            <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`} />
        </div>
    );
}

export function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-600">Loading...</p>
            </div>
        </div>
    );
}

// ==========================================
// STATUS COMPONENTS
// ==========================================

export function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.replace(/_/g, ' ')}
    </span>
    );
}

export function ProgressBar({ progress, showLabel = true }: { progress: number; showLabel?: boolean }) {
    return (
        <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-xs text-gray-600 min-w-[3rem] text-right">{progress}%</span>
            )}
        </div>
    );
}

// ==========================================
// ALERT COMPONENTS
// ==========================================

interface AlertProps {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message: string;
    onClose?: () => void;
}

export function Alert({ type = 'info', title, message, onClose }: AlertProps) {
    const styles = {
        info: {
            container: 'bg-blue-50 border-blue-200',
            icon: <Info className="h-5 w-5 text-blue-400" />,
            title: 'text-blue-800',
            message: 'text-blue-700'
        },
        success: {
            container: 'bg-green-50 border-green-200',
            icon: <CheckCircle className="h-5 w-5 text-green-400" />,
            title: 'text-green-800',
            message: 'text-green-700'
        },
        warning: {
            container: 'bg-yellow-50 border-yellow-200',
            icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
            title: 'text-yellow-800',
            message: 'text-yellow-700'
        },
        error: {
            container: 'bg-red-50 border-red-200',
            icon: <XCircle className="h-5 w-5 text-red-400" />,
            title: 'text-red-800',
            message: 'text-red-700'
        }
    };

    const style = styles[type];

    return (
        <div className={`rounded-md border p-4 ${style.container}`}>
            <div className="flex">
                <div className="flex-shrink-0">{style.icon}</div>
                <div className="ml-3 flex-1">
                    {title && (
                        <h3 className={`text-sm font-medium ${style.title}`}>{title}</h3>
                    )}
                    <div className={`text-sm ${style.message} ${title ? 'mt-1' : ''}`}>
                        {message}
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-3 inline-flex rounded-md p-1.5 hover:bg-white hover:bg-opacity-20 focus:outline-none"
                    >
                        <XCircle className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
}

export function ErrorMessage({ message }: { message: string }) {
    return <Alert type="error" message={message} />;
}

export function SuccessMessage({ message }: { message: string }) {
    return <Alert type="success" message={message} />;
}

// ==========================================
// EMPTY STATE COMPONENTS
// ==========================================

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="text-center py-12">
            {icon && (
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">{icon}</div>
            )}
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
            {action && (
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={action.onClick}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {action.label}
                    </button>
                </div>
            )}
        </div>
    );
}

// ==========================================
// MODAL COMPONENTS
// ==========================================

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full">
                    <div className={`${sizeClasses[size]} mx-auto`}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>
                            <div>{children}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// CARD COMPONENTS
// ==========================================

interface CardProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

export function Card({ title, subtitle, children, actions, className = '' }: CardProps) {
    return (
        <div className={`bg-white shadow-sm rounded-lg ${className}`}>
            {(title || subtitle || actions) && (
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            {title && (
                                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                            )}
                            {subtitle && (
                                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                            )}
                        </div>
                        {actions && <div>{actions}</div>}
                    </div>
                </div>
            )}
            <div className="px-6 py-4">{children}</div>
        </div>
    );
}

// ==========================================
// METRIC CARD COMPONENT
// ==========================================

interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: React.ComponentType<any>;
    iconColor?: string;
    bgColor?: string;
    trend?: number;
    trendLabel?: string;
}

export function MetricCard({ title, value, icon: Icon, iconColor = 'text-gray-600', bgColor = 'bg-gray-100', trend, trendLabel }: MetricCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
                    {trend !== undefined && trendLabel && (
                        <p className={`mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <span className="font-medium">
                                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                            </span>
                            <span className="text-gray-500 ml-1">{trendLabel}</span>
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`ml-4 p-3 ${bgColor} rounded-lg`}>
                        <Icon className={`h-6 w-6 ${iconColor}`} />
                    </div>
                )}
            </div>
        </div>
    );
}
