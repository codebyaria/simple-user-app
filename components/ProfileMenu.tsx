'use client'

import { signOut } from '@/app/(auth)/login/actions';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useState } from 'react';
import ConfirmationDialog from './ConfirmationDialog';

export default function ProfileMenu() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
        
        const handleLogout = async () => {
            try {
                signOut();
            } catch (error) {
                console.error('Logout error:', error);
            }
        };
    

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    return (
        <div className="relative">
            {/* Profile Menu */}
            <button
                onClick={toggleDropdown}
                className="p-2 flex gap-1 items-center transition-transform duration-300"
                aria-expanded={isDropdownOpen}
            >
                <Image
                    src={'/assets/logo/avatar-default.png'}
                    width={32}
                    height={32}
                    alt="Avatar User Image"
                />

                <ChevronDownIcon
                    className={`w-6 h-6 text-gray-600 dark:text-gray-200 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                />
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform ${isDropdownOpen ? 'max-h-screen opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'
                    }`}
            >
                <div className="px-2 py-2 text-sm text-gray-800 dark:text-gray-200">
                    <button 
                        onClick={() => setShowConfirmDialog(true)}
                        className="px-4 py-2 w-full rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
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
            </div>
        </div>
    );
}
