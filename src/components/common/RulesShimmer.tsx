import React from 'react';

export default function RulesShimmer() {
    return (
        <div className="space-y-6">
            {/* Header shimmer */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>

            {/* Filters shimmer */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>

            {/* Table shimmer */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-2 py-3">
                                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                                </th>
                                <th className="px-2 py-3">
                                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                </th>
                                <th className="px-2 py-3">
                                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                                </th>
                                <th className="px-2 py-3 hidden md:table-cell">
                                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                </th>
                                <th className="px-2 py-3">
                                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                                </th>
                                <th className="px-2 py-3 hidden lg:table-cell">
                                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                                </th>
                                <th className="px-2 py-3 hidden lg:table-cell">
                                    <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
                                </th>
                                <th className="px-2 py-3">
                                    <div className="h-3 w-14 bg-gray-200 rounded animate-pulse mx-auto" />
                                </th>
                                <th className="px-2 py-3">
                                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[...Array(10)].map((_, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-2 py-3">
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                    </td>
                                    <td className="px-2 py-3">
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                    </td>
                                    <td className="px-2 py-3">
                                        <div className="h-6 w-16 bg-blue-100 rounded animate-pulse" />
                                    </td>
                                    <td className="px-2 py-3 hidden md:table-cell">
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                    </td>
                                    <td className="px-2 py-3 text-center">
                                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse mx-auto" />
                                    </td>
                                    <td className="px-2 py-3 hidden lg:table-cell">
                                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                    </td>
                                    <td className="px-2 py-3 hidden lg:table-cell">
                                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                                    </td>
                                    <td className="px-2 py-3 text-center">
                                        <div className="h-6 w-16 bg-green-100 rounded animate-pulse mx-auto" />
                                    </td>
                                    <td className="px-2 py-3">
                                        <div className="flex items-center justify-end space-x-1">
                                            <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-4 w-1 bg-gray-300 animate-pulse" />
                                            <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-4 w-1 bg-gray-300 animate-pulse" />
                                            <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}