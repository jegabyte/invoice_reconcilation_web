import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full text-center">
                <h1 className="text-9xl font-bold text-gray-200">404</h1>
                <h2 className="mt-4 text-3xl font-semibold text-gray-900">Page not found</h2>
                <p className="mt-2 text-gray-600">
                    Sorry, we couldn't find the page you're looking for.
                </p>
                
                <div className="mt-8 flex justify-center space-x-4">
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Go to Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}