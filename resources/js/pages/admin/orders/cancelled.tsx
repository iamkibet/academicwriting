import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderCard from '@/components/OrderCard';
import { XCircleIcon } from 'lucide-react';

interface Order {
  id: number;
  title: string;
  status: string;
  price: number;
  pages: number;
  deadline_date: string;
  payment_status: string;
  client: {
    id: number;
    name: string;
    email: string;
  };
  writer?: {
    id: number;
    name: string;
  };
  academic_level: {
    name: string;
  };
  service_type: {
    name: string;
  };
  created_at: string;
}

interface CancelledOrdersProps {
  orders: {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  statistics: {
    total_cancelled: number;
    cancelled_this_month: number;
    cancelled_this_week: number;
    total_lost_revenue: number;
  };
}

export default function CancelledOrders({ orders, statistics }: CancelledOrdersProps) {
  return (
    <div className="space-y-6">
      <Head title="Cancelled Orders" />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{statistics.total_cancelled}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-red-600">{statistics.cancelled_this_month}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-red-600">{statistics.cancelled_this_week}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lost Revenue</p>
                <p className="text-2xl font-bold text-red-600">${statistics.total_lost_revenue.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancelled Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Cancelled Orders ({orders.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No cancelled orders found.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.data.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
