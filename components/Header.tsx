'use client';

import DarkModeToggle from "@/components/DarkModeToggle"
import ProfileMenu from "@/components/ProfileMenu"
import { Bars3Icon } from "@heroicons/react/24/outline"
import NavLogoBrand from "./NavLogoBrand";

interface HeaderProps {
    onMenuToggle: () => void;
    isMobileMenuOpen: boolean;
    isSidebarCollapse: boolean;
}

export default function Header({ onMenuToggle, isMobileMenuOpen, isSidebarCollapse }: HeaderProps) {
    return (
        <header className={`sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700`}>
            <div className={`px-4 sm:px-6 lg:px-8 ${isSidebarCollapse ? 'lg:ml-24' : 'lg:ml-[20%]'}`}>
                <div className="flex items-center justify-between h-16">
                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={onMenuToggle}
                    >
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <div className="block lg:hidden"><NavLogoBrand/></div>
                    <div className="hidden lg:block text-base text-gray-800 dark:text-white font-medium">Halo, Admin</div>

                    {/* Right side navigation items */}
                    <div className="flex items-center gap-4 ml-auto">
                        <DarkModeToggle />
                        <ProfileMenu />
                    </div>
                </div>
            </div>
        </header>
    );
}