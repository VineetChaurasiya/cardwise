export type Category =
  | 'grocery'
  | 'dining'
  | 'online_shopping'
  | 'travel'
  | 'fuel'
  | 'utility'
  | 'entertainment'
  | 'education'
  | 'gold_jewellery'
  | 'insurance'
  | 'rent'
  | 'health_pharmacy'
  | 'electronics'
  | 'foreign_currency';

export type PaymentMode = 'online' | 'offline';

export interface RewardRule {
  category: Category;
  rewardRate: string;
  note: string;
}

export interface CreditCard {
  id: string;
  issuer: string;
  name: string;
  network: 'Visa' | 'Mastercard' | 'Amex' | 'RuPay';
  gradient: string;
  annualFee: string;
  rewards: RewardRule[];
}

export type RewardPreference = 'cashback' | 'points';

export interface CardComparison {
  cardId: string;
  issuer: string;
  name: string;
  gradient: string;
  network: string;
  rateDescription: string | null;
  computedReward: string | null;
}

export interface Recommendation {
  card: CreditCard;
  rewardRate: string;
  explanation: string;
  sourceQuote?: string;
  estimatedReward?: string;
  pointsEarned?: number;
  pointValueInr?: number;
  comparison: CardComparison[];
  rewardsEqual: boolean;
  secondaryCard?: CreditCard;
  secondaryNote?: string;
}

export type DocStatus = 'processing' | 'ready' | 'error';

export interface CardDocument {
  id: string;
  cardId: string;
  fileName: string;
  fileSizeKb: number;
  uploadedAt: number;
  status: DocStatus;
}
