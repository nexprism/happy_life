/**
 * Formats job / gig budget values into a human-readable currency string.
 * Handles objects { min, max, currency }, JSON strings, numbers, and plain strings.
 */
export const formatBudget = (budget, fallback = 'Flexible') => {
  if (budget === null || budget === undefined || budget === '') return fallback;

  let parsed = budget;

  // Handle JSON string or raw string
  if (typeof budget === 'string') {
    const trimmed = budget.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        parsed = JSON.parse(trimmed);
      } catch (e) {
        return budget;
      }
    } else {
      return budget;
    }
  }

  if (typeof parsed === 'number') {
    return `₹${parsed.toLocaleString('en-IN')}`;
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const currency = parsed.currency || 'INR';
    const minVal = parsed.min !== undefined && parsed.min !== null && parsed.min !== '' ? Number(parsed.min) : null;
    const maxVal = parsed.max !== undefined && parsed.max !== null && parsed.max !== '' ? Number(parsed.max) : null;

    if (currency === 'LPA') {
      if (minVal !== null && maxVal !== null && minVal > 0 && maxVal > 0) {
        return `${minVal} - ${maxVal} LPA`;
      }
      if (maxVal !== null && maxVal > 0) {
        return `Up to ${maxVal} LPA`;
      }
      if (minVal !== null && minVal > 0) {
        return `From ${minVal} LPA`;
      }
      return `${minVal || maxVal || 0} LPA`;
    }

    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : (currency ? `${currency} ` : '₹');

    const fmt = (num) => {
      if (num === null || num === undefined || isNaN(num)) return '';
      return currency === 'INR' ? num.toLocaleString('en-IN') : num.toLocaleString('en-US');
    };

    if (minVal !== null && maxVal !== null) {
      if (minVal === 0 && maxVal > 0) {
        return `Up to ${symbol}${fmt(maxVal)}`;
      }
      if (minVal > 0 && maxVal === 0) {
        return `From ${symbol}${fmt(minVal)}`;
      }
      if (minVal > 0 && maxVal > 0) {
        return `${symbol}${fmt(minVal)} - ${symbol}${fmt(maxVal)}`;
      }
    }
    if (maxVal !== null && maxVal > 0) {
      return `Up to ${symbol}${fmt(maxVal)}`;
    }
    if (minVal !== null && minVal > 0) {
      return `From ${symbol}${fmt(minVal)}`;
    }
    return fallback;
  }

  return String(budget);
};

export default formatBudget;
