import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { 
  CalendarIcon, 
  FileTextIcon, 
  ClockIcon, 
  UserIcon, 
  MessageSquareIcon, 
  FolderIcon, 
  CreditCardIcon, 
  XIcon,
  CheckIcon
} from 'lucide-react';
import { 
  OrderStatus, 
  getOrderStatusLabel, 
  getOrderStatusColor, 
  getOrderStatusProgressStage,
  isOrderStatusRequiresPayment 
} from '@/types/order-status';

interface Order {
  id: number;
  title: string;
  status: string;
  deadline_date: string;
  pages?: number;
  academic_level_id?: number;
  service_type_id?: number;
  academic_level?: {
    id: number;
    level: string;
  };
  paper_type?: string;
  discipline?: {
    id: number;
    name: string;
  };
  service_type?: {
    id: number;
    name: string;
  };
  total_price?: number;
  writer_name?: string;
  created_at: string;
  description: string;
  words: number;
  price: string;
  payment_status?: string;
}

interface OrderCardProps {
  order: Order;
}

// Status colors and labels are now handled by the order-status utility functions

// Progress stages for the order workflow
const progressStages = [
  { key: 'payment', label: 'Payment', shortLabel: 'Payment', color: 'blue' },
  { key: 'writer', label: 'Writer Assigned', shortLabel: 'Writer', color: 'gray' },
  { key: 'progress', label: 'In Progress', shortLabel: 'Progress', color: 'gray' },
  { key: 'review', label: 'Under Review', shortLabel: 'Review', color: 'gray' },
  { key: 'approval', label: 'Approval', shortLabel: 'Approval', color: 'gray' },
];

const getCurrentStage = (status: string, paymentStatus?: string) => {
  // If payment is unpaid/pending, always show stage 0
  if (paymentStatus === 'unpaid' || paymentStatus === 'pending') return 0;
  
  // Get the status-based progress stage
  const stage = getOrderStatusProgressStage(status);
  
  // If status is cancelled or in_revision, don't show progress bar
  if (stage === -1) return -1;
  
  return stage;
};

export default function OrderCard({ order }: OrderCardProps) {
  const handleClick = () => {
    router.visit(`/dashboard/orders/${order.id}`);
  };

  const handleMessages = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.visit(`/dashboard/orders/${order.id}#messages`);
  };

  const handleFiles = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.visit(`/dashboard/orders/${order.id}#files`);
  };

  const handlePayment = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.visit(`/dashboard/orders/${order.id}#payment`);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle cancel order
    router.patch(`/dashboard/orders/${order.id}/cancel`);
  };

  const currentStage = getCurrentStage(order.status, order.payment_status);
  const isUnpaid = order.payment_status === 'unpaid' || order.payment_status === 'pending' || isOrderStatusRequiresPayment(order.status);
  const isCancelled = order.status === 'cancelled';
  const isInRevision = order.status === 'in_revision';
  const deadlineDate = new Date(order.deadline_date);
  const isUrgent = deadlineDate.getTime() - Date.now() < 24 * 60 * 60 * 1000; // Less than 24 hours

  return (
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header Section with Progress Bar */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-blue-600 hover:text-blue-800 cursor-pointer" onClick={handleClick}>
                {order.title}
              </h3>
              {isCancelled && (
                <Badge className="bg-red-100 text-red-800">
                  Cancelled
                </Badge>
              )}
              {isInRevision && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  In Revision
                </Badge>
              )}
            </div>
        <div className="text-sm text-gray-600 mb-2">
          #{String(order.id).padStart(4, '0')} / {order.pages} pages / {order.paper_type || order.discipline?.name || 'N/A'} / {order.academic_level?.level || 'N/A'}
        </div>
            <div className="text-sm text-gray-600">
              Deadline: {deadlineDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })} {isUrgent && !isCancelled && '(if you pay right now)'}
            </div>
          </div>
          
          {/* Progress Bar - Top Right (only show if not cancelled/in_revision) */}
          {currentStage !== -1 && (
            <div className="flex items-center text-sm font-medium">
              {progressStages.map((stage, index) => (
                <div key={stage.key} className="flex items-center -ml-2 first:ml-0">
                  <div className={`relative flex items-center px-4 py-2 transition-colors ${
                    index === currentStage 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`} style={{
                    clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)'
                  }}>
                    <span className="whitespace-nowrap text-sm font-medium">
                      {stage.shortLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Status Message */}
        {isUnpaid && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-gray-700">
              Your order is unpaid. Please check your email and follow the tips to complete the payment procedure.
            </p>
          </div>
        )}

        {/* Action Buttons and Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMessages}
              className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <MessageSquareIcon className="w-4 h-4" />
              Messages
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFiles}
              className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <FolderIcon className="w-4 h-4" />
              Files
            </Button>
            {isUnpaid && !isCancelled && (
              <Button
                size="sm"
                onClick={handlePayment}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <CreditCardIcon className="w-4 h-4" />
                Pay Now
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {!isCancelled && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <XIcon className="w-4 h-4" />
                Cancel order
              </Button>
            )}
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                ${Number(order.price || order.total_price || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
