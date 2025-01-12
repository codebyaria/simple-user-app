'use client';

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LogoBrand from "@/public/assets/logo/logo-brand.png"
import { XMarkIcon } from '@heroicons/react/24/outline'
import { UserPlusIcon, UsersIcon, ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline"
import { usePathname } from 'next/navigation';
import ConfirmationDialog from './ConfirmationDialog';
import { signOut } from '@/app/(auth)/login/actions';

interface MobileNavProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
    const pathname = usePathname();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleLogout = async () => {
        try {
            signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50 lg:hidden">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </TransitionChild>

                <div className="fixed inset-0 flex">
                    <TransitionChild
                        as={Fragment}
                        enter="transform transition ease-in-out duration-300"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in-out duration-300"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full"
                    >
                        <DialogPanel className="relative flex flex-col w-4/5 max-w-sm bg-white dark:bg-gray-800">
                            {/* Mobile menu header */}
                            <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <Link href="/customers" className="flex items-center gap-2">
                                        <Image
                                            src={LogoBrand}
                                            alt="Logo"
                                            width={40}
                                            height={40}
                                        />
                                        <span className="text-xl font-bold text-blue-950 dark:text-white">
                                            CUSTOMER MAN
                                        </span>
                                    </Link>
                                    <button
                                        onClick={onClose}
                                        className="p-2 -m-2 text-gray-400 hover:text-gray-500"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile menu links */}
                            <div className="flex-1 px-4 py-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            Customers
                                        </div>
                                        <Link
                                            href="/customers/create"
                                            className={`flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700 ${pathname === '/customers/create' ? 'bg-gray-50 dark:bg-gray-700 font-semibold' : ''}`}
                                            onClick={onClose}
                                        >
                                            <UserPlusIcon className="w-5 h-5 mr-2" />
                                            Create Customer
                                        </Link>
                                        <Link
                                            href="/customers"
                                            className={`flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700 ${pathname === '/customers' ? 'bg-gray-50 dark:bg-gray-700 font-semibold' : ''}`}
                                            onClick={onClose}
                                        >
                                            <UsersIcon className="w-5 h-5 mr-2" />
                                            List Customer
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile menu footer */}
                            <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setShowConfirmDialog(true)}
                                    className="flex items-center w-full px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    <ArrowLeftStartOnRectangleIcon className="w-5 h-5 mr-2" />
                                    Logout
                                </button>
                                <ConfirmationDialog
                                    isOpen={showConfirmDialog}
                                    onClose={() => setShowConfirmDialog(false)}
                                    onConfirm={handleLogout}
                                    title="Are you sure you want to logout?"
                                    message="You will be logged out of your account and will need to log in again to access your dashboard."
                                    confirmText="Logout"
                                    confirmButtonClass="bg-red-500 hover:bg-red-600"
                                />
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}