import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { CalendarIcon, FileTextIcon, ClockIcon, UserIcon } from 'lucide-react';

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

interface OrderCardProps {
  order: Order;
}

const statusColors = {
  placed: 'bg-blue-100 text-blue-800',
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-purple-100 text-purple-800',
  waiting_for_review: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  in_revision: 'bg-yellow-100 text-yellow-800',
};

const statusLabels = {
  placed: 'Placed',
  draft: 'Draft',
  active: 'Active',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  waiting_for_review: 'Under Review',
  completed: 'Completed',
  cancelled: 'Cancelled',
  in_revision: 'In Revision',
};

export default function OrderCard({ order }: OrderCardProps) {
  const handleClick = () => {
    router.visit(`/dashboard/orders/${order.id}`);
  };

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={handleClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {order.title}
              </h3>
              <Badge className={`${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                {statusLabels[order.status as keyof typeof statusLabels] || order.status}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {order.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <FileTextIcon className="h-4 w-4" />
                <span>{order.pages} pages</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <UserIcon className="h-4 w-4" />
                <span>{order.academic_level || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <CalendarIcon className="h-4 w-4" />
                <span>{new Date(order.deadline || order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <ClockIcon className="h-4 w-4" />
                <span>${Number(order.price || order.total_price || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
