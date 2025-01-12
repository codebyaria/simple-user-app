'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import CustomerForm from '@/components/CustomerForm';
import { useEffect } from 'react';
import { ApiResponse, CustomerInput } from '@/types/database.types';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultCustomerInput: CustomerInput = {
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    birth_date: '',
    nationality: 'wni',
    country_id: null,
    photo_url: '',
};

export default function EditCustomerPage() {
    const router = useRouter();
    const params = useParams();
    const customerId = params?.id as string || '';

    const [customer, setCustomer] = useState<CustomerInput>(defaultCustomerInput);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await fetch(`/api/customers/${customerId}`);
                const result: ApiResponse<CustomerInput> = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to fetch customer details');
                }

                if (result.data) {
                    // Ensure all required fields are present
                    const customerData: CustomerInput = {
                        ...defaultCustomerInput,
                        ...result.data,
                    };
                    setCustomer(customerData);
                }
            } catch (error) {
                toast.error('Failed to fetch customer details');
                console.error('Error fetching customer:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (customerId) {
            fetchCustomer();
        }
    }, [customerId]);

    const handleSubmit = async (formData: CustomerInput) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/customers/${customerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            console.log(response);

            if (!response.ok) {
                const errorText = await response.text(); // Read the raw response for debugging
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            let data;
            try {
                data = await response.json();
            } catch {
                data = null; // Handle cases where the response is empty
            }

            toast.success('Customer updated successfully', {
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
            toast.error(error instanceof Error ? error.message : 'Failed to update customer', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            console.error('Error updating customer:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">Loading customer details...</p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-red-500">Customer not found.</p>
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
                <span className="text-gray-600 dark:text-gray-300">Edit</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col-reverse gap-y-2 md:flex-row justify-between items-center mb-5">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Customer</h1>
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
                <CustomerForm initialValues={customer}
                    onSubmit={handleSubmit}
                    isEditing={true}
                    isSubmitting={isSubmitting} />
            </div >
        </div >
    );
}