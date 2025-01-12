'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function UserDetailPage() {
    const params = useParams(); // Get URL parameters
    const userId = params?.id as string || ''; // Assuming `id` is part of the URL
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(`/api/customers/${userId}`);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to fetch user details');
                }

                setUser(result.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

    if (isLoading) {
        return (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">Loading user details...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-red-500">{error || 'User not found.'}</p>
                <Link
                    href="/customers"
                    className="inline-block mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md"
                >
                    Back to Customers
                </Link>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-red-500">User not found.</p>
                <Link
                    href="/customers"
                    className="inline-block mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md"
                >
                    Back to Customers
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
            {/* Header */}
            <div className="flex flex-col items-start gap-y-3 md:flex-row md:justify-between md:items-center mb-5">
                {/* Breadcrumb */}
                <nav className="flex text-sm text-gray-500 dark:text-gray-400">
                    <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                        Home
                    </Link>
                    <ChevronRightIcon className="w-5 h-5 mx-1" />
                    <Link href="/customers" className="hover:text-blue-600 dark:hover:text-blue-400">
                        Customers
                    </Link>
                    <ChevronRightIcon className="w-5 h-5 mx-1" />
                    <span className="text-gray-600 dark:text-gray-300">Details</span>
                </nav>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md ms-auto md:ms-0"
                >
                    <ArrowLeftIcon width={16} height={16} />
                    Back
                </Link>
            </div>

            {/* User Details */}
            <div className='md:w-2/3'>
                <div className="flex flex-col md:flex-row gap-5 mb-5">
                    <div>
                        <Image
                            src={user.photo_url || '/assets/logo/avatar-default.png'}
                            alt={user.full_name}
                            width={100}
                            height={100}
                            className="rounded-full object-cover bg-gray-50"
                        />
                    </div>
                    <div>
                        <h1 className='text-3xl text-gray-800 dark:text-white font-bold mt-4'>{user.full_name}</h1>
                        <p className='text-base text-gray-600 dark:text-white font-medium mb-5'>Indonesia</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                            <div>
                                <p className='text-sm text-gray-400 dark:text-white'>Email</p>
                                <p className="text-gray-800 dark:text-white">
                                    {user.email}
                                </p>
                            </div>

                            <div>
                                <p className='text-sm text-gray-400 dark:text-white'>Phone</p>
                                <p className="text-gray-800 dark:text-white">
                                    {user.phone_number}
                                </p>
                            </div>

                            <div>
                                <p className='text-sm text-gray-400 dark:text-white'>Birth Date</p>
                                <p className="text-gray-800 dark:text-white">
                                    {user.birth_date}
                                </p>
                            </div>

                            <div>
                                <p className='text-sm text-gray-400 dark:text-white'>Nationality</p>
                                <p className="text-gray-800 dark:text-white">
                                    {user.nationality === 'wni' ? 'WNI' : 'WNA'}
                                </p>
                            </div>

                            <div className='md:col-span-2'>
                                <p className='text-sm text-gray-400 dark:text-white'>Address</p>
                                <p className="text-gray-800 dark:text-white">
                                    {user.address}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
