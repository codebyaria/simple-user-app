import DarkModeToggle from "@/components/DarkModeToggle"
import Image from 'next/image';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <header className="px-6 py-4 border-b border-b-1 border-b-gray-200 dark:border-b-white top-0 left-0 right-0 fixed">
                <div className="container mx-auto">
                    <nav className="flex justify-between items-center">
                        <div className="text-black dark:text-white text-2xl font-bold">
                            Customer Management <span className="text-blue-500">App</span>
                        </div>
                        <DarkModeToggle />
                    </nav>
                </div>
            </header>
            <div className="min-h-screen flex items-center justify-center bg-inherit">
                <div className="w-full max-w-md p-6">
                    {children}
                </div>
            </div>
        </>
    )
}