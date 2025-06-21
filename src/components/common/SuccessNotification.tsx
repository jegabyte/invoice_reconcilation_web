import { CheckCircle, X, Loader2, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessNotificationProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    subMessage?: string;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

export default function SuccessNotification({
    isOpen,
    onClose,
    title = "Success!",
    message = "Operation completed successfully",
    subMessage,
    autoClose = true,
    autoCloseDelay = 5000
}: SuccessNotificationProps) {
    const [show, setShow] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
            setProgress(100);
            
            if (autoClose) {
                const interval = setInterval(() => {
                    setProgress(prev => Math.max(0, prev - (100 / (autoCloseDelay / 100))));
                }, 100);

                const timer = setTimeout(() => {
                    handleClose();
                }, autoCloseDelay);

                return () => {
                    clearInterval(interval);
                    clearTimeout(timer);
                };
            }
        }
    }, [isOpen, autoClose, autoCloseDelay]);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300); // Allow animation to complete
    };

    if (!isOpen && !show) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
            show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-md">
                <div className="p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                                <div className="absolute inset-0 animate-ping">
                                    <CheckCircle className="h-10 w-10 text-green-500 opacity-30" />
                                </div>
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                            <p className="mt-1 text-sm text-gray-600">{message}</p>
                            {subMessage && (
                                <p className="mt-2 text-xs text-gray-500 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {subMessage}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="ml-4 flex-shrink-0 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                {autoClose && (
                    <div className="h-1 bg-gray-100">
                        <div 
                            className="h-full bg-green-500 transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// Processing notification variant
export function ProcessingNotification({
    isOpen,
    title = "Processing Invoice",
    message = "Your invoice is being processed and will be available shortly.",
    estimatedTime = "2-3 minutes"
}: {
    isOpen: boolean;
    title?: string;
    message?: string;
    estimatedTime?: string;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-md">
                <div className="p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                                </div>
                            </div>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                            <p className="mt-1 text-sm text-gray-600">{message}</p>
                            <div className="mt-3 flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>Estimated time: {estimatedTime}</span>
                            </div>
                            <div className="mt-2">
                                <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                                    <div className="animate-progress-bar bg-blue-500 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}