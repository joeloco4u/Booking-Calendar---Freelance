export const cleanDate = (rawDate: string) => {  if (!rawDate) return '';
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {}
  if (rawDate.includes('/')) {
    const parts = rawDate.split(' ');
    if (parts.length >= 2) {
      const dateParts = parts[1].split('/');
      if (dateParts.length >= 3) {
        const [dd, mm, yyyy] = dateParts;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mi = parseInt(mm, 10) - 1;
        if (mi >= 0 && mi <= 11) {
          return `${monthNames[mi]} ${parseInt(dd, 10)}, ${yyyy}`;
        }
      }
    }
  }
  return rawDate;
};

export const extractDay = (rawDate: string) => {
  if (!rawDate) return null;
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) return d.getDate();
  } catch (e) {}
  if (rawDate.includes('/')) {
    const parts = rawDate.split(' ');
    if (parts.length >= 2) return parseInt(parts[1].split('/')[0], 10);
  }
  return null;
};

export const formatDisplayDate = (raw: string) => {
  if (!raw) return '';
  const match = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(match[2], 10) - 1]} ${match[1]}, ${match[3]}`;
  }
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch(e) {}
  return raw;
};
