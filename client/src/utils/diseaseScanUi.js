export const getActiveUserId = (user) => user?.uid || user?.id || user?._id || user?.email || '';

export const formatScanDate = (value) => {
    if (!value) return 'Just now';

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return 'Just now';

    return new Intl.DateTimeFormat('en-MY', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(parsedDate);
};

export const formatRelativeScanTime = (value) => {
    if (!value) return 'Just now';

    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return 'Just now';

    const diffMs = Date.now() - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) return 'Just now';
    if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
    return `${Math.floor(diffMs / day)}d ago`;
};

export const getUrgencyStyles = (urgency) => {
    switch (urgency) {
        case 'Critical':
            return 'bg-red-100 text-red-700 border-red-200';
        case 'High':
            return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'Medium':
            return 'bg-amber-100 text-amber-700 border-amber-200';
        default:
            return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
};
