import type { Category, PaymentMode } from '../types';

export const CATEGORY_LABELS: Record<Category, string> = {
  grocery:          'Grocery',
  dining:           'Dining',
  online_shopping:  'Online Shopping',
  travel:           'Travel',
  fuel:             'Fuel',
  utility:          'Utility Bills',
  entertainment:    'Entertainment',
  education:        'Education',
  gold_jewellery:   'Gold & Jewellery',
  insurance:        'Insurance',
  rent:             'Rent',
  health_pharmacy:  'Health & Pharmacy',
  electronics:      'Electronics',
  foreign_currency: 'Foreign Currency',
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  grocery:          '🛒',
  dining:           '🍽️',
  online_shopping:  '📦',
  travel:           '✈️',
  fuel:             '⛽',
  utility:          '💡',
  entertainment:    '🎬',
  education:        '📚',
  gold_jewellery:   '💛',
  insurance:        '🛡️',
  rent:             '🏠',
  health_pharmacy:  '💊',
  electronics:      '📱',
  foreign_currency: '💱',
};

const ONLINE_CATEGORIES: Category[] = [
  'grocery', 'dining', 'online_shopping', 'electronics',
  'education', 'entertainment', 'insurance', 'utility',
];

const OFFLINE_CATEGORIES: Category[] = [
  'grocery', 'dining', 'fuel', 'travel', 'gold_jewellery',
  'rent', 'health_pharmacy', 'education', 'entertainment',
  'insurance', 'utility', 'foreign_currency',
];

export function getCategoriesForMode(mode: PaymentMode): Category[] {
  return mode === 'online' ? ONLINE_CATEGORIES : OFFLINE_CATEGORIES;
}
