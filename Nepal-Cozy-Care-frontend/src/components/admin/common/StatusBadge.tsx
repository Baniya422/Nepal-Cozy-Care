interface StatusBadgeProps {
  status: string | boolean;
  type?: 'active' | 'order' | 'payment';
}

export default function StatusBadge({ status, type = 'active' }: StatusBadgeProps) {
  const getStatusClass = () => {
    switch (type) {
      case 'active':
        return status === 'active' || status === '1' || status === true
          ? 'admin-status-active'
          : 'admin-status-inactive';
      case 'order':
        switch (String(status).toLowerCase()) {
          case 'completed':
          case 'delivered':
            return 'status-completed';
          case 'pending':
            return 'status-pending';
          case 'packed':
          case 'processing':
            return 'status-packed';
          case 'shipped':
            return 'status-shipped';
          case 'out_for_delivery':
            return 'status-out_for_delivery';
          case 'cancelled':
            return 'status-cancelled';
          default:
            return 'status-pending';
        }
      case 'payment':
        return status === 'paid' ? 'admin-status-paid' : 'admin-status-unpaid';
      default:
        return 'admin-status-active';
    }
  };

  const getStatusLabel = () => {
    if (type === 'active') {
      return status === 'active' || status === '1' || status === true ? 'Active' : 'Inactive';
    }
    return String(status)
      .split('_')
      .join(' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <span className={`admin-status-badge ${getStatusClass()}`}>
      {getStatusLabel()}
    </span>
  );
}
