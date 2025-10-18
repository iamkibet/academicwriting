import AppLogo from '@/components/app-logo';
import { Icon } from '@/components/icon';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronDownIcon, FilePlus2, FileText, Gift, HelpCircle, LogOut, Percent, UserCog2, Wallet } from 'lucide-react';
import { PropsWithChildren, useRef, useState } from 'react';

interface Props {
    user: User;
    children: React.ReactNode;
}

export default function ClientLayout({ children, user }: PropsWithChildren<Props>) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const handleMouseEnter = () => setOpen(true);
    const handleMouseLeave = (e: React.MouseEvent) => {
        if (!triggerRef.current?.contains(e.relatedTarget as Node)) {
            setOpen(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-100">
            {/* Header */}
            <header className="">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center">
                            <AppLogo />
                        </div>
                        {/* Right side - Theme switcher and User dropdown */}
                        <div className="flex items-center gap-3">
                            {/* Theme Switcher */}
                            <ThemeSwitcher />
                            
                            {/* User dropdown */}
                            <DropdownMenu open={open} onOpenChange={setOpen}>
                            <DropdownMenuTrigger asChild>
                                <button
                                    ref={triggerRef}
                                    className="flex items-center gap-2 rounded-full border px-2 py-1 transition hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                    aria-haspopup="menu"
                                    aria-expanded={open}
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>
                                            <UserCog2 className="h-5 w-5 text-gray-400" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDownIcon className={`ml-1 h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                                <div className="px-3 py-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>
                                                <UserCog2 className="h-5 w-5 text-gray-400" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="truncate font-medium text-gray-900">{user.name}</div>
                                            <div className="truncate text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/orders" className="flex w-full items-center gap-2">
                                        <FileText className="size-4 text-blue-500" />
                                        My Orders
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="#" className="flex w-full items-center gap-2">
                                        <Percent className="size-4 text-green-500" />
                                        Discount
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/logout" method="post" as="button" className="flex w-full items-center gap-2 text-red-600">
                                        <LogOut className="size-4" />
                                        Logout
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                    </div>
                </div>
                {/* Navigation/Actions */}
                <nav className="w-full bg-[#05ADA3] py-2">
                    <MaxWidthWrapper className="flex w-full items-center justify-between">
                        <div className="flex h-full gap-2">
                            <Link
                                href="/orders"
                                className={`flex h-full items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-[#048e86] ${currentPath.startsWith('/orders') ? 'bg-[#048e86] shadow-md' : ''}`}
                            >
                                <Icon iconNode={FileText} className="h-5 w-5 text-white" />
                                My Orders
                            </Link>
                            <Link
                                href="#"
                                className={`relative flex h-full items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-[#048e86] ${currentPath === '/client/rewards' ? 'bg-[#048e86] shadow-md' : ''}`}
                            >
                                <Icon iconNode={Gift} className="h-5 w-5 text-white" />
                                Rewards program
                                <span className="ml-2 inline-flex items-center rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-white">
                                    New
                                </span>
                            </Link>
                        </div>
                        <div className="flex h-full gap-2">
                            <Link
                                href="/wallet"
                                className={`flex h-full items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-[#048e86] ${currentPath === '/wallet' ? 'bg-[#048e86] shadow-md' : ''}`}
                            >
                                <Icon iconNode={Wallet} className="h-5 w-5 text-white" />
                                My Wallet
                            </Link>
                            <Link
                                href="#"
                                className={`flex h-full items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-[#048e86] ${currentPath === '/client/inquiry' ? 'bg-[#048e86] shadow-md' : ''}`}
                            >
                                <Icon iconNode={HelpCircle} className="h-5 w-5 text-white" />
                                Free Inquiry
                            </Link>
                            <Link
                                href="/orders/create"
                                className="flex h-full items-center gap-2 rounded-lg px-4 py-2 font-medium text-white hover:bg-[#048e86]"
                            >
                                <Icon iconNode={FilePlus2} className="h-5 w-5 text-white" />
                                New Order
                            </Link>
                        </div>
                    </MaxWidthWrapper>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <div className="">{children}</div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between md:flex-row">
                        <div className="mb-4 flex flex-wrap justify-center gap-4 md:mb-0">
                            <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
                                FAQs
                            </Link>
                            <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
                                Contact Us
                            </Link>
                            <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
                                Terms and Conditions
                            </Link>
                            <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
                                Privacy Policy
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500">© 2025 Academic Writing. All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
