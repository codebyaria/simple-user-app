'use client';

import Link from 'next/link';
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import CustomerForm from '@/components/CustomerForm';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { CustomerInput } from '@/types/database.types';

const initialCustomerData = {
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    birth_date: '',
    nationality: 'wni',
    country_id: null,
    photo_url: '',
};


export default function CreateCustomerPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle form submission
    const handleSubmit = async (formData: CustomerInput) => {
        setIsSubmitting(true);
        console.log(formData);
        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    // Convert date to ISO string if it exists
                    birth_date: formData.birth_date ? new Date(formData.birth_date).toISOString() : null,
                    // Convert country_id to number if it exists
                    country_id: formData.country_id ? Number(formData.country_id) : null
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create customer');
            }

            await response.json();

            toast.success('Customer created successfully', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            router.push('/customers');
            router.refresh();

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create customer', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            console.error('Error creating customer:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
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
            {/* Breadcrumb */}
            <nav className="flex mb-5 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                    Home
                </Link>
                <ChevronRightIcon className="w-5 h-5 mx-1" />
                <Link href="/customers" className="hover:text-blue-600 dark:hover:text-blue-400">
                    Customers
                </Link>
                <ChevronRightIcon className="w-5 h-5 mx-1" />
                <span className="text-gray-600 dark:text-gray-300">Create</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col-reverse gap-y-2 md:flex-row justify-between items-center mb-5">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Add Customer</h1>
                    <p className="text-base font-medium text-gray-500 dark:text-gray-400">
                        Fill in the details to create a new customer.
                    </p>
                </div>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md ms-auto md:ms-0"
                >
                    <ArrowLeftIcon width={16} height={16} />
                    Back
                </Link>
            </div>

            <div className="w-full xl:w-2/3">
                <CustomerForm initialValues={initialCustomerData} onSubmit={handleSubmit} 
                isSubmitting={isSubmitting} />
            </div >
        </div >
    );
}