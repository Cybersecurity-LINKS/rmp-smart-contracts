export const getAlgColor = (href: string) => {
    const filename = href.split('/').pop() || '';

    if (filename.toLowerCase().includes('pqc')) {
        return "#10B981"; // green-500
    }
    if (filename.toLowerCase().includes('hybrid')) {
        return "#8B5CF6"; // purple-500
    }
    if (filename.toLowerCase().includes('zk')) {
        return "#EF4444"; // red-500
    }
    return "#3B82F6"; // blue-500
};
  