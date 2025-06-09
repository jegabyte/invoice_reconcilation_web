import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h1 className="text-center text-3xl font-bold text-primary-600">
                        Invoice Reconciliation
                    </h1>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Streamline your invoice processing
                    </p>
                </div>
                
                <div className="mt-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}