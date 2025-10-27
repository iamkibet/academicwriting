import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  OrderStatus, 
  getOrderStatusLabel, 
  getOrderStatusColor, 
  ORDER_STATUS_OPTIONS 
} from '@/types/order-status';
import { 
  FilterIcon, 
  EditIcon, 
  CheckIcon, 
  XIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';

interface Order {
  id: number;
  title: string;
  status: string;
  price: number;
  pages: number;
  deadline_date: string;
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

interface StatusManagementProps {
  orders: {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  statusOptions: Array<{
    value: string;
    label: string;
    shortLabel: string;
  }>;
  currentStatus?: string;
  statistics: {
    total_orders: number;
    waiting_for_payment: number;
    writer_pending: number;
    in_progress: number;
    review: number;
    approval: number;
    total_revenue: number;
  };
}

export default function StatusManagement({ 
  orders, 
  statusOptions, 
  currentStatus, 
  statistics 
}: StatusManagementProps) {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [bulkNotes, setBulkNotes] = useState<string>('');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      router.get('/admin/orders/status-management');
    } else {
      router.get('/admin/orders/status-management', { status });
    }
  };

  const handleBulkUpdate = () => {
    if (selectedOrders.length === 0 || !bulkStatus) return;

    router.post('/admin/orders/status-management/bulk-update', {
      order_ids: selectedOrders,
      status: bulkStatus,
      notes: bulkNotes,
    }, {
      onSuccess: () => {
        setSelectedOrders([]);
        setBulkStatus('');
        setBulkNotes('');
        setIsBulkDialogOpen(false);
      },
    });
  };

  const handleSingleUpdate = (order: Order) => {
    if (!editStatus) return;

    router.post(`/admin/orders/status-management/${order.id}`, {
      status: editStatus,
      notes: editNotes,
    }, {
      onSuccess: () => {
        setEditingOrder(null);
        setEditStatus('');
        setEditNotes('');
      },
    });
  };

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(orders.data.map(order => order.id));
  };

  const clearSelection = () => {
    setSelectedOrders([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case OrderStatus.WAITING_FOR_PAYMENT:
        return <AlertCircleIcon className="w-4 h-4" />;
      case OrderStatus.WRITER_PENDING:
        return <UsersIcon className="w-4 h-4" />;
      case OrderStatus.IN_PROGRESS:
        return <ClockIcon className="w-4 h-4" />;
      case OrderStatus.REVIEW:
        return <EditIcon className="w-4 h-4" />;
      case OrderStatus.APPROVAL:
        return <CheckCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Head title="Order Status Management" />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{statistics.total_orders}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileTextIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Waiting Payment</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.waiting_for_payment}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircleIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Writer Pending</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.writer_pending}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">{statistics.in_progress}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Review</p>
                <p className="text-2xl font-bold text-purple-600">{statistics.review}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <EditIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approval</p>
                <p className="text-2xl font-bold text-green-600">{statistics.approval}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FilterIcon className="w-4 h-4" />
                <Label htmlFor="status-filter">Filter by Status:</Label>
              </div>
              <Select value={currentStatus || 'all'} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {selectedOrders.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedOrders.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                  <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        Bulk Update
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Bulk Update Status</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bulk-status">New Status</Label>
                          <Select value={bulkStatus} onValueChange={setBulkStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="bulk-notes">Notes (Optional)</Label>
                          <Textarea
                            id="bulk-notes"
                            value={bulkNotes}
                            onChange={(e) => setBulkNotes(e.target.value)}
                            placeholder="Add notes for this status change..."
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsBulkDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleBulkUpdate}>
                            Update {selectedOrders.length} Orders
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.data.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No orders found for the selected status.
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    checked={selectedOrders.length === orders.data.length}
                    onCheckedChange={(checked) => 
                      checked ? selectAllOrders() : clearSelection()
                    }
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>

                <div className="space-y-2">
                  {orders.data.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm truncate">
                            #{String(order.id).padStart(4, '0')} - {order.title}
                          </h3>
                          <Badge className={getOrderStatusColor(order.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {getOrderStatusLabel(order.status)}
                            </div>
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Client: {order.client.name} ({order.client.email})</p>
                          <p>
                            {order.pages} pages • {order.academic_level.name} • {order.service_type.name}
                          </p>
                          <p>Deadline: {formatDate(order.deadline_date)}</p>
                          <p>Price: ${order.price.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingOrder(order);
                                setEditStatus(order.status);
                                setEditNotes('');
                              }}
                            >
                              <EditIcon className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Order Status</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-status">Status</Label>
                                <Select value={editStatus} onValueChange={setEditStatus}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusOptions.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="edit-notes">Notes (Optional)</Label>
                                <Textarea
                                  id="edit-notes"
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  placeholder="Add notes for this status change..."
                                  rows={3}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingOrder(null)}
                                >
                                  Cancel
                                </Button>
                                <Button onClick={() => handleSingleUpdate(order)}>
                                  Update Status
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
