import React from 'react';

const ShimmerLine = ({ width = 'w-full', height = 'h-4', className = '' }: { width?: string; height?: string; className?: string }) => (
    <div className={`${width} ${height} bg-gray-200 rounded animate-pulse ${className}`} />
);

const ShimmerCard = () => (
    <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <ShimmerLine width="w-20" height="h-3" />
                <ShimmerLine width="w-16" height="h-6" />
            </div>
            <div className="h-6 w-6 bg-gray-200 rounded" />
        </div>
    </div>
);

const ShimmerTableRow = () => (
    <tr className="border-b border-gray-200">
        <td className="px-3 py-3 text-center">
            <ShimmerLine width="w-8" height="h-4" className="mx-auto" />
        </td>
        <td className="px-4 py-3">
            <ShimmerLine width="w-32" height="h-4" />
        </td>
        <td className="px-4 py-3">
            <ShimmerLine width="w-24" height="h-4" />
        </td>
        <td className="px-4 py-3">
            <ShimmerLine width="w-20" height="h-4" />
        </td>
        <td className="px-4 py-3">
            <ShimmerLine width="w-20" height="h-4" />
        </td>
        <td className="px-4 py-3 text-right">
            <ShimmerLine width="w-24" height="h-4" className="ml-auto" />
        </td>
        <td className="px-4 py-3 text-center">
            <div className="flex justify-center">
                <ShimmerLine width="w-20" height="h-6" className="rounded-full" />
            </div>
        </td>
        <td className="px-4 py-3 text-center">
            <ShimmerLine width="w-20" height="h-4" className="mx-auto" />
        </td>
    </tr>
);

export default function InvoicesShimmer() {
    return (
        <div className="space-y-6">
            {/* Header Shimmer */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <ShimmerLine width="w-48" height="h-8" />
                    <ShimmerLine width="w-64" height="h-4" />
                </div>
                <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>

            {/* Filters Shimmer */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-48 h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>

            {/* Summary Cards Shimmer */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[...Array(5)].map((_, index) => (
                    <ShimmerCard key={index} />
                ))}
            </div>

            {/* Table Shimmer */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3"><ShimmerLine width="w-8" height="h-3" /></th>
                                <th className="px-4 py-3"><ShimmerLine width="w-24" height="h-3" /></th>
                                <th className="px-4 py-3"><ShimmerLine width="w-16" height="h-3" /></th>
                                <th className="px-4 py-3"><ShimmerLine width="w-20" height="h-3" /></th>
                                <th className="px-4 py-3"><ShimmerLine width="w-28" height="h-3" /></th>
                                <th className="px-4 py-3"><ShimmerLine width="w-24" height="h-3" /></th>
                                <th className="px-4 py-3"><ShimmerLine width="w-16" height="h-3" /></th>
                                <th className="px-4 py-3"><ShimmerLine width="w-16" height="h-3" /></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[...Array(10)].map((_, index) => (
                                <ShimmerTableRow key={index} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}