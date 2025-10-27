import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    BookOpen, 
    Folder, 
    LayoutGrid, 
    FileText, 
    Users, 
    CreditCard, 
    Settings, 
    Wallet,
    ShoppingCart,
    BarChart3,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    GraduationCap,
    Globe
} from 'lucide-react';
import AppLogo from './app-logo';

// Client navigation items
const clientNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard/orders',
        icon: LayoutGrid,
    },
    {
        title: 'Place Order',
        href: '/dashboard/orders/create',
        icon: ShoppingCart,
    },
    {
        title: 'My Orders',
        href: '/dashboard/orders',
        icon: FileText,
    },
    {
        title: 'Wallet',
        href: '/dashboard/wallet',
        icon: Wallet,
    },
];

// Admin navigation items
const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Orders',
        href: '/admin/orders',
        icon: FileText,
    },
    {
        title: 'Pending Orders',
        href: '/admin/orders/pending',
        icon: Clock,
    },
    {
        title: 'Active Orders',
        href: '/admin/orders/active',
        icon: BarChart3,
    },
    {
        title: 'Cancelled Orders',
        href: '/admin/orders/cancelled',
        icon: XCircle,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;
    
    // Determine navigation items based on user role
    const mainNavItems = user.role === 'admin' ? adminNavItems : clientNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
