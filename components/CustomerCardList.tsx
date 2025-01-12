'use client'

import { Customer } from '@/types/database.types';
import { ClockIcon, EnvelopeIcon, EyeIcon, HomeIcon, PencilIcon, PhoneIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationDialog from './ConfirmationDialog';

interface CustomerCardListProps {
    filter: "all" | "wni" | "wna";
    sortBy: "full_name" | "email" | "created_at" | "";
    sortOrder: "asc" | "desc";
    search: string;
    onCustomerDelete: () => void;
}

export default function CustomerCardList({ filter, sortBy, sortOrder, search, onCustomerDelete }: CustomerCardListProps) {
    const [data, setData] = useState<Customer[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const limit = 10;

    const loadCustomers = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                filter,
                search,
                ...(sortBy && { sortBy, sortOrder }),
            });

            const response = await fetch(`/api/customers?${queryParams}`);
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }

            const result = await response.json();
            setData((prev) => (page === 1 ? result.data : [...prev, ...result.data]));
            setHasMore(result.data.length === limit);
            setPage((prev) => prev + 1);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred');
            console.error('Error loading customers:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, page, filter, search, sortBy, sortOrder]);

    useEffect(() => {
        setData([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        loadCustomers();
    }, [filter, sortBy, sortOrder, search]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isLoading && hasMore) {
                    loadCustomers();
                }
            },
            { threshold: 0.5 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [isLoading, hasMore, loadCustomers]);

    const handleDelete = async (customer: Customer) => {
        try {
            const response = await fetch(`/api/customers/${customer.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete customer');
            }

            setData(prev => prev.filter(item => item.id !== customer.id));
            toast.success(`${customer.full_name} deleted successfully`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            onCustomerDelete();
        } catch (error) {
            console.error('Error deleting customer:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete customer. Please try again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setCustomerToDelete(null);
        }
    };

    if (error) {
        return (
            <div className="text-center py-8 text-red-600">
                <p>{error}</p>
                <button
                    onClick={() => loadCustomers()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.length === 0 && !isLoading && <div className="py-4 text-center text-gray-400 col-span-3">No Data Found</div>}
                {data.length > 0 && data.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-blue-100 dark:from-blue-800 to-[#1d4ed880]"
                    >
                        <div className="flex gap-2 items-center pb-2 border-b border-b-white mb-3">
                            <Image
                                src={item.photo_url || "/assets/logo/avatar-default.png"}
                                alt={item.full_name}
                                className="rounded-full"
                                width={40}
                                height={40}
                            />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{item.full_name}</h3>
                                <p className="text-sm font-normal text-gray-600 dark:text-white">{item.countries?.name || 'Indonesia'}</p>
                            </div>
                            <div className="ms-auto">
                                <span className="px-3 py-1 rounded-full bg-white text-sm text-black font-semibold">{item.nationality.toUpperCase()}</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-white font-semibold flex gap-2 items-center"><EnvelopeIcon width={16} height={16} /> {item.email}</p>
                        <p className="text-sm text-gray-700 dark:text-white font-semibold flex gap-2 items-center"><PhoneIcon width={16} height={16} /> {item.phone_number}</p>
                        <p className="text-sm text-gray-700 dark:text-white font-semibold flex gap-2 items-center"><HomeIcon width={16} height={16} /> {item.address}</p>
                        <div className="flex flex-col lg:flex-row justify-end gap-2 mt-4">
                            <p className="text-sm text-gray-500 dark:text-white flex gap-1 items-center lg:me-auto">
                                <ClockIcon width={16} height={16} /> {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
                            </p>
                            <div className="flex gap-2">
                                <Link
                                    href={`customers/${item.id}`}
                                    className="inline-flex gap-2 items-center px-3 py-1 bg-blue-500 bg-opacity-80 hover:bg-blue-600 text-white text-sm transition-color duration-75 ease-in-out rounded-md"
                                >
                                    <EyeIcon width={16} height={16} /> Detail
                                </Link>
                                <Link
                                    href={`customers/${item.id}/edit`}
                                    className="inline-flex gap-2 items-center px-3 py-1 bg-emerald-500 bg-opacity-80 hover:bg-emerald-600 text-white text-sm transition-color duration-75 ease-in-out rounded-md"
                                >
                                    <PencilIcon width={16} height={16} /> Edit
                                </Link>
                                <button
                                    onClick={() => setCustomerToDelete(item)}
                                    className="inline-flex gap-2 items-center px-3 py-1 bg-red-500 bg-opacity-80 hover:bg-red-600 text-white text-sm transition-color duration-75 ease-in-out rounded-md"
                                >
                                    <TrashIcon width={16} height={16} />
                                </button>
                                <ConfirmationDialog
                                    isOpen={customerToDelete ? true : false}
                                    onClose={() => setCustomerToDelete(null)}
                                    onConfirm={() => customerToDelete && handleDelete(customerToDelete)}
                                    title="Are you sure you want to delete this customer?"
                                    message={`This will permanently delete ${customerToDelete?.full_name}'s record and cannot be undone.`}
                                    confirmText="Delete"
                                    confirmButtonClass="bg-red-500 hover:bg-red-600"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Observer for Lazy Loading */}
            <div ref={observerRef} className="h-10 mt-4">
                {isLoading && <p className="text-center text-gray-500">Loading...</p>}
            </div>
        </>
    );
}
