import { Card } from '@/components/common';

export default function InvoiceDetailShimmer() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Header Shimmer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Invoice Summary Shimmer */}
            <Card>
                <div className="p-6">
                    <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i}>
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-5 w-32 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Reconciliation Summary Shimmer */}
            <Card>
                <div className="p-4">
                    <div className="h-6 w-48 bg-gray-200 rounded mb-3"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="p-2 bg-gray-50 rounded">
                                <div className="flex items-center justify-between">
                                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                                    <div className="h-4 w-8 bg-gray-200 rounded ml-2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Extraction Results Shimmer */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-6 w-48 bg-gray-200 rounded"></div>
                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="grid grid-cols-7 gap-4 px-4 py-2">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                        {/* Table rows shimmer */}
                        {[...Array(3)].map((_, rowIndex) => (
                            <div key={rowIndex} className="grid grid-cols-7 gap-4 px-4 py-3 border-t">
                                {[...Array(7)].map((_, colIndex) => (
                                    <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Reconciliation Details Shimmer */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-6 w-48 bg-gray-200 rounded"></div>
                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="grid grid-cols-9 gap-4 px-4 py-2">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                        {/* Table rows shimmer */}
                        {[...Array(3)].map((_, rowIndex) => (
                            <div key={rowIndex} className="grid grid-cols-9 gap-4 px-4 py-3 border-t">
                                {[...Array(9)].map((_, colIndex) => (
                                    <div key={colIndex} className={`h-4 bg-gray-200 rounded ${colIndex === 6 ? 'mx-auto w-16' : ''}`}></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
}