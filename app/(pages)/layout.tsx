'use client';

import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import MobileNav from "@/components/MobileNav"
import Footer from "@/components/Footer"
import { useState, useEffect } from "react"

export default function PageLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarCollapse, setIsSidebarCollapse] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

    useEffect(() => {
        const checkMobile = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarCollapse(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header
                onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                isSidebarCollapse={isSidebarCollapse}
            />
            
            <div className="flex flex-1">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block">
                    <Sidebar 
                        onToggleCollapse={(isCollapse) => setIsSidebarCollapse(isCollapse)} 
                    />
                </div>

                {/* Mobile Navigation Menu */}
                <MobileNav 
                    isOpen={isMobileMenuOpen} 
                    onClose={() => setIsMobileMenuOpen(false)} 
                />

                {/* Main Content */}
                <main className={`flex-1 p-6 ${isSidebarCollapse ? 'lg:ml-20' : 'lg:ml-[20%]'}`}>
                    {children}
                </main>
            </div>

            <Footer />
        </div>
    );
}