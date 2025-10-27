export enum OrderStatus {
  WAITING_FOR_PAYMENT = 'waiting_for_payment',
  WRITER_PENDING = 'writer_pending',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  APPROVAL = 'approval',
  CANCELLED = 'cancelled',
  IN_REVISION = 'in_revision',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.WAITING_FOR_PAYMENT]: 'Waiting for Payment',
  [OrderStatus.WRITER_PENDING]: 'Writer Pending',
  [OrderStatus.IN_PROGRESS]: 'In Progress',
  [OrderStatus.REVIEW]: 'Review',
  [OrderStatus.APPROVAL]: 'Approval',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.IN_REVISION]: 'In Revision',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.WAITING_FOR_PAYMENT]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.WRITER_PENDING]: 'bg-blue-100 text-blue-800',
  [OrderStatus.IN_PROGRESS]: 'bg-orange-100 text-orange-800',
  [OrderStatus.REVIEW]: 'bg-purple-100 text-purple-800',
  [OrderStatus.APPROVAL]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [OrderStatus.IN_REVISION]: 'bg-yellow-100 text-yellow-800',
};

export const ORDER_STATUS_SHORT_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.WAITING_FOR_PAYMENT]: 'Payment',
  [OrderStatus.WRITER_PENDING]: 'Writer',
  [OrderStatus.IN_PROGRESS]: 'Progress',
  [OrderStatus.REVIEW]: 'Review',
  [OrderStatus.APPROVAL]: 'Approval',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.IN_REVISION]: 'Revision',
};

export const ORDER_STATUS_PROGRESS_STAGES: Record<OrderStatus, number> = {
  [OrderStatus.WAITING_FOR_PAYMENT]: 0,
  [OrderStatus.WRITER_PENDING]: 1,
  [OrderStatus.IN_PROGRESS]: 2,
  [OrderStatus.REVIEW]: 3,
  [OrderStatus.APPROVAL]: 4,
  [OrderStatus.CANCELLED]: -1, // Not shown in progress bar
  [OrderStatus.IN_REVISION]: -1, // Not shown in progress bar
};

export const ORDER_STATUS_OPTIONS = Object.values(OrderStatus).map(status => ({
  value: status,
  label: ORDER_STATUS_LABELS[status],
  shortLabel: ORDER_STATUS_SHORT_LABELS[status],
}));

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] || status;
}

export function getOrderStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status as OrderStatus] || 'bg-gray-100 text-gray-800';
}

export function getOrderStatusProgressStage(status: string): number {
  return ORDER_STATUS_PROGRESS_STAGES[status as OrderStatus] || 0;
}

export function isOrderStatusActive(status: string): boolean {
  return status !== OrderStatus.WAITING_FOR_PAYMENT;
}

export function isOrderStatusCompleted(status: string): boolean {
  return status === OrderStatus.APPROVAL;
}

export function isOrderStatusRequiresPayment(status: string): boolean {
  return status === OrderStatus.WAITING_FOR_PAYMENT;
}
