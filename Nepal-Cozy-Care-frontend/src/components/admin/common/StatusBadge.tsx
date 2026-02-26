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
            return 'admin-status-completed';
          case 'pending':
            return 'admin-status-pending';
          case 'processing':
            return 'admin-status-processing';
          case 'shipped':
            return 'admin-status-shipped';
          case 'cancelled':
            return 'admin-status-cancelled';
          default:
            return 'admin-status-pending';
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
    return String(status).charAt(0).toUpperCase() + String(status).slice(1);
  };

  return (
    <span className={`admin-status-badge ${getStatusClass()}`}>
      {getStatusLabel()}
    </span>
  );
}
