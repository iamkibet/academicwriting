import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  OrderStatus, 
  getOrderStatusLabel, 
  getOrderStatusColor, 
  ORDER_STATUS_OPTIONS 
} from '@/types/order-status';
import { EditIcon, CheckIcon, XIcon } from 'lucide-react';

interface OrderStatusChangeProps {
  order: {
    id: number;
    status: string;
  };
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

export default function OrderStatusChange({ order, currentStatus, onStatusChange }: OrderStatusChangeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = () => {
    if (newStatus === currentStatus) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    
    router.post(`/admin/orders/status-management/${order.id}`, {
      status: newStatus,
      notes: notes,
    }, {
      onSuccess: () => {
        setIsEditing(false);
        setNotes('');
        onStatusChange?.(newStatus);
      },
      onError: () => {
        setIsSubmitting(false);
      },
      onFinish: () => {
        setIsSubmitting(false);
      },
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewStatus(currentStatus);
    setNotes('');
  };

  const getValidNextStatuses = () => {
    // This would ideally come from the backend, but for now we'll use a simple approach
    const currentStatusEnum = currentStatus as OrderStatus;
    
    switch (currentStatusEnum) {
      case OrderStatus.WAITING_FOR_PAYMENT:
        return [OrderStatus.WRITER_PENDING, OrderStatus.CANCELLED];
      case OrderStatus.WRITER_PENDING:
        return [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED];
      case OrderStatus.IN_PROGRESS:
        return [OrderStatus.REVIEW, OrderStatus.CANCELLED];
      case OrderStatus.REVIEW:
        return [OrderStatus.APPROVAL, OrderStatus.IN_REVISION, OrderStatus.CANCELLED];
      case OrderStatus.APPROVAL:
        return []; // No transitions from approval
      case OrderStatus.CANCELLED:
        return []; // No transitions from cancelled
      case OrderStatus.IN_REVISION:
        return [OrderStatus.REVIEW, OrderStatus.CANCELLED];
      default:
        return [];
    }
  };

  const validNextStatuses = getValidNextStatuses();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <EditIcon className="w-5 h-5" />
          Order Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status Display */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-gray-600">Current Status</Label>
            <div className="mt-1">
              <Badge className={getOrderStatusColor(currentStatus)}>
                {getOrderStatusLabel(currentStatus)}
              </Badge>
            </div>
          </div>
          
          {!isEditing && validNextStatuses.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <EditIcon className="w-4 h-4" />
              Change Status
            </Button>
          )}
        </div>

        {/* Status Change Form */}
        {isEditing && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="new-status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {validNextStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getOrderStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status-notes">Notes (Optional)</Label>
              <Textarea
                id="status-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for this status change..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleStatusChange}
                disabled={isSubmitting || newStatus === currentStatus}
                size="sm"
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Update Status
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                size="sm"
                className="flex items-center gap-2"
              >
                <XIcon className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* No Valid Transitions Message */}
        {!isEditing && validNextStatuses.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            No status changes available for this order.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
