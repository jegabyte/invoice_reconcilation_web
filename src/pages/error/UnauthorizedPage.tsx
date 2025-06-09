import { Link } from 'react-router-dom';
import { Lock, Home } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full text-center">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
                    <Lock className="h-12 w-12 text-red-600" />
                </div>
                
                <h2 className="mt-6 text-3xl font-semibold text-gray-900">Access Denied</h2>
                <p className="mt-2 text-gray-600">
                    You don't have permission to access this page.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    Please contact your administrator if you believe this is an error.
                </p>
                
                <div className="mt-8">
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}