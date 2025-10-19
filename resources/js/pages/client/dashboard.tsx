import { Head, router } from '@inertiajs/react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import OrderCard from '@/components/OrderCard';
import ClientLayout from '@/components/layouts/ClientLayout';
import { User } from '@/types';
import { CheckCircle, Clock, FileText, XCircle, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Order {
    id: number;
    title: string;
    status: string;
    deadline: string;
    subject?: string;
    pages?: number;
    academic_level?: string;
    total_price?: number;
    writer_name?: string;
    created_at: string;
    description: string;
    words: number;
    price: string;
}

interface ClientDashboardPageProps {
  auth: {
    user: User;
  };
  stats?: {
    total_orders: number
    pending_orders: number
    active_orders: number
    completed_orders: number
    cancelled_orders: number
    total_spent: number
  }
  wallet?: {
    balance: number
    formatted_balance: string
    statistics: {
      current_balance: number
      total_credits: number
      total_debits: number
      total_transactions: number
      credit_transactions: number
      debit_transactions: number
    }
  }
  orders?: Order[]
  recentOrders?: Order[]
  currentTab?: string
  errors?: Record<string, string>
}

const TABS = [
    { key: 'recent', label: 'Recent Orders', icon: <Clock className="h-5 w-5" /> },
    { key: 'active', label: 'Active', icon: <Activity className="h-5 w-5" /> },
    { key: 'completed', label: 'Completed', icon: <CheckCircle className="h-5 w-5" /> },
    { key: 'cancelled', label: 'Cancelled', icon: <XCircle className="h-5 w-5" /> },
];

function EmptyState({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">{icon}</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>
        </div>
    );
}

export default function ClientDashboardPage({ 
  auth,
  stats, 
  wallet, 
  orders,
  recentOrders, 
  currentTab = 'recent',
  errors 
}: ClientDashboardPageProps) {
    const { user } = auth;
    const [activeTab, setActiveTab] = useState(currentTab);
    
    // Use orders from backend if available, otherwise fall back to recentOrders
    const allOrders = orders || recentOrders || [];
    
    // Handle tab change with URL update
    const handleTabChange = (tabKey: string) => {
        setActiveTab(tabKey);
        router.get('/dashboard/orders', { tab: tabKey }, {
            preserveState: true,
            replace: true
        });
    };
    
    // Update active tab when currentTab prop changes
    useEffect(() => {
        setActiveTab(currentTab);
    }, [currentTab]);

    return (
        <>
            <Head title="Dashboard" />
            <ClientLayout user={user}>
                <div className="bg-gray-50 py-8">
                    <MaxWidthWrapper>
                        <div className="mb-8">
                            {/* Tabs */}
                            <div>
                                <div className="border-b border-gray-200">
                                    <nav className="-mb-px flex space-x-4 overflow-x-auto pb-px sm:space-x-8" aria-label="Tabs">
                                        {TABS.map((tab) => (
                                            <button
                                                key={tab.key}
                                                onClick={() => handleTabChange(tab.key)}
                                                className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${
                                                    activeTab === tab.key
                                                        ? 'border-blue-500 text-blue-600'
                                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                                } `}
                                            >
                                                {tab.icon}
                                                {tab.label}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="mt-6">
                            {allOrders.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6">
                                    {allOrders.map((order: any) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-8">
                                    {activeTab === 'recent' && (
                                        <EmptyState
                                            title="No recent orders"
                                            description="Get started by creating your first academic writing order. Our expert writers are ready to help you succeed."
                                            icon={<FileText className="h-6 w-6 text-gray-400" />}
                                        />
                                    )}
                                    {activeTab === 'active' && (
                                        <EmptyState
                                            title="No active orders"
                                            description="Active orders will appear here once you place an order and it's being worked on."
                                            icon={<Clock className="h-6 w-6 text-gray-400" />}
                                        />
                                    )}
                                    {activeTab === 'completed' && (
                                        <EmptyState
                                            title="No completed orders"
                                            description="Completed orders will appear here once your assignments are finished."
                                            icon={<CheckCircle className="h-6 w-6 text-gray-400" />}
                                        />
                                    )}
                                    {activeTab === 'cancelled' && (
                                        <EmptyState
                                            title="No cancelled orders"
                                            description="Cancelled orders will appear here if you choose to cancel any assignments."
                                            icon={<XCircle className="h-6 w-6 text-gray-400" />}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </MaxWidthWrapper>
                </div>
            </ClientLayout>
        </>
    );
}
