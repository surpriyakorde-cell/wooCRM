export const money = value => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(Number(value || 0));

export const fullName = customer => `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Guest customer';
