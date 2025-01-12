// components/Sidebar.tsx
'use client'

import {
    ArrowLeftStartOnRectangleIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    UserGroupIcon,
    UserPlusIcon,
    UsersIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import NavLogoBrand from "./NavLogoBrand";
import { usePathname } from 'next/navigation'
import ConfirmationDialog from "./ConfirmationDialog";
import { signOut } from "@/app/(auth)/login/actions";

interface SidebarProps {
    onToggleCollapse?: (isCollapsed: boolean) => void;
}

export default function Sidebar({ onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [isCustomerOpen, setIsCustomerOpen] = useState<boolean>(true);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    
    const handleLogout = async () => {
        try {
            signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Check screen size on mount and resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) { // lg breakpoint
                setIsCollapsed(true);
                onToggleCollapse?.(true);
            }
        };

        // Initial check
        handleResize();

        // Add resize listener
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [onToggleCollapse]);

    const toggleSidebar = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);
        onToggleCollapse?.(newCollapsedState);
    };

    const toggleCustomerDropdown = () => {
        if (!isCollapsed) {
            setIsCustomerOpen(!isCustomerOpen);
        }
    };

    const handleMouseOver = () => {
        if (isCollapsed) {
            toggleSidebar();
        }
    };

    return (
        <div
            className={`
                fixed left-0 top-0 h-screen bg-white dark:bg-gray-800
                transition-all duration-300 ease-in-out
                ${isCollapsed ? "w-20" : "w-1/5"}
                border-r border-gray-200 dark:border-gray-700
                hidden lg:flex lg:flex-col z-50
            `}
        >
            {/* Sidebar Header */}
            <div className={`
                flex items-center justify-between 
                h-16 px-4 
                border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'relative' : ''} 
            `}>
                <NavLogoBrand />
                <button
                    onClick={toggleSidebar}
                    className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isCollapsed ? 'absolute -right-10' : ''} `}
                >
                    {isCollapsed ? (
                        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
                    )}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className="p-4 flex flex-col flex-1">
                <ul className="space-y-2 flex-1">
                    {/* Customers Section */}
                    <li>
                        <button
                            onClick={toggleCustomerDropdown}
                            className={`
                                w-full px-3 py-2 rounded-md
                                flex items-center justify-between
                                transition-colors duration-200
                                ${isCustomerOpen ? 'bg-blue-50 dark:bg-gray-700 text-blue-700' : 'text-gray-700'}
                                dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700
                            `}
                            onMouseOver={handleMouseOver}
                        >
                            <span className="flex items-center gap-3">
                                <UserGroupIcon className="w-5 h-5" />
                                {!isCollapsed && "Customers"}
                            </span>
                            {!isCollapsed && (
                                isCustomerOpen ?
                                    <ChevronUpIcon className="w-4 h-4" /> :
                                    <ChevronDownIcon className="w-4 h-4" />
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {isCustomerOpen && !isCollapsed && (
                            <ul className="mt-2 space-y-1 pl-8">
                                <li>
                                    <Link
                                        href="/customers/create"
                                        className={`
                                            flex items-center gap-3 px-3 py-2 rounded-md
                                            text-gray-700 dark:text-gray-200
                                            hover:bg-gray-50 dark:hover:bg-gray-700
                                            transition-colors duration-200 ${pathname === '/customers/create' ? 'bg-gray-50 dark:bg-gray-700 font-semibold' : ''}
                                        `}
                                    >
                                        <UserPlusIcon className="w-5 h-5" />
                                        Create Customer
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/customers"
                                        className={`
                                            flex items-center gap-3 px-3 py-2 rounded-md
                                            text-gray-700 dark:text-gray-200
                                            hover:bg-gray-50 dark:hover:bg-gray-700
                                            transition-colors duration-200 ${pathname === '/customers' ? 'bg-gray-50 dark:bg-gray-700 font-semibold' : ''}
                                        `}
                                    >
                                        <UsersIcon className="w-5 h-5" />
                                        List Customer
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                </ul>

                {/* Logout Button */}
                <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setShowConfirmDialog(true)}
                        className="w-full px-3 py-2 rounded-md
                                flex items-center gap-3
                                text-gray-700 dark:text-gray-200
                                hover:bg-gray-50 dark:hover:bg-gray-700
                                transition-colors duration-200"
                    >
                        <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
                        {!isCollapsed && "Logout"}
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
            </nav>
        </div>
    );
}