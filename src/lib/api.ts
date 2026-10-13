import type { CardDocument, Category, CreditCard, Recommendation, RewardPreference } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'https://cardwise-kwh4.onrender.com/api';

async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: isFormData
      ? { ...authHeader, ...init?.headers }
      : { 'Content-Type': 'application/json', ...authHeader, ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    let detail: string | undefined;
    try {
      detail = JSON.parse(body).detail;
    } catch {
      // body wasn't JSON; fall through to generic error below
    }
    throw new Error(typeof detail === 'string' ? detail : `${res.status} ${res.statusText}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

interface ApiCreditCard {
  id: string;
  issuer: string;
  name: string;
  network: CreditCard['network'];
  gradient: string;
  annual_fee: string;
  rewards: { category: Category; reward_rate: string; note: string }[];
}

function mapCard(api: ApiCreditCard): CreditCard {
  return {
    id: api.id,
    issuer: api.issuer,
    name: api.name,
    network: api.network,
    gradient: api.gradient,
    annualFee: api.annual_fee,
    rewards: api.rewards.map((r) => ({ category: r.category, rewardRate: r.reward_rate, note: r.note })),
  };
}

interface ApiCardDocument {
  id: string;
  card_id: string;
  file_name: string;
  file_size_kb: number;
  status: CardDocument['status'];
  uploaded_at: string;
}

function mapDocument(api: ApiCardDocument): CardDocument {
  return {
    id: api.id,
    cardId: api.card_id,
    fileName: api.file_name,
    fileSizeKb: api.file_size_kb,
    status: api.status,
    uploadedAt: new Date(api.uploaded_at).getTime(),
  };
}

export async function fetchCards(): Promise<CreditCard[]> {
  const cards = await request<ApiCreditCard[]>('/cards');
  return cards.map(mapCard);
}

export interface NewCardInput {
  issuer: string;
  name: string;
  network: CreditCard['network'];
  annualFee: string;
  gradient: string;
}

export async function adminLogin(password: string): Promise<string> {
  const res = await request<{ token: string }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  return res.token;
}

export async function createCard(input: NewCardInput, token: string): Promise<CreditCard> {
  const card = await request<ApiCreditCard>('/cards', {
    method: 'POST',
    body: JSON.stringify({
      issuer: input.issuer,
      name: input.name,
      network: input.network,
      annual_fee: input.annualFee,
      gradient: input.gradient,
    }),
  }, token);
  return mapCard(card);
}

export async function updateCard(cardId: string, input: NewCardInput, token: string): Promise<CreditCard> {
  const card = await request<ApiCreditCard>(`/cards/${cardId}`, {
    method: 'PUT',
    body: JSON.stringify({
      issuer: input.issuer,
      name: input.name,
      network: input.network,
      annual_fee: input.annualFee,
      gradient: input.gradient,
    }),
  }, token);
  return mapCard(card);
}

export function deleteCard(cardId: string, token: string): Promise<void> {
  return request(`/cards/${cardId}`, { method: 'DELETE' }, token);
}

export function createSession(): Promise<string> {
  return request<{ session_id: string }>('/session', { method: 'POST' }).then((r) => r.session_id);
}

export function getUserCardIds(sessionId: string): Promise<string[]> {
  return request(`/session/${sessionId}/cards`);
}

export function setUserCardIds(sessionId: string, cardIds: string[]): Promise<string[]> {
  return request(`/session/${sessionId}/cards`, {
    method: 'PUT',
    body: JSON.stringify({ card_ids: cardIds }),
  });
}

interface ApiCardComparison {
  card_id: string;
  issuer: string;
  name: string;
  gradient: string;
  network: string;
  rate_description: string | null;
  computed_reward: string | null;
}

interface ApiRecommendResponse {
  card: ApiCreditCard | null;
  reward_rate?: string;
  explanation?: string;
  source_quote?: string;
  estimated_reward?: string;
  points_earned?: number;
  point_value_inr?: number;
  comparison?: ApiCardComparison[];
}

export async function fetchRecommendation(
  sessionId: string,
  amount: number,
  category: Category,
  rewardPreference: RewardPreference,
): Promise<Recommendation | null> {
  const res = await request<ApiRecommendResponse>('/recommend', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, amount, category, reward_preference: rewardPreference }),
  });
  if (!res.card) return null;
  return {
    card: mapCard(res.card),
    rewardRate: res.reward_rate ?? '',
    explanation: res.explanation ?? '',
    sourceQuote: res.source_quote,
    estimatedReward: res.estimated_reward,
    pointsEarned: res.points_earned,
    pointValueInr: res.point_value_inr,
    comparison: (res.comparison ?? []).map((c) => ({
      cardId: c.card_id,
      issuer: c.issuer,
      name: c.name,
      gradient: c.gradient,
      network: c.network,
      rateDescription: c.rate_description,
      computedReward: c.computed_reward,
    })),
  };
}

export async function listDocuments(cardId: string): Promise<CardDocument[]> {
  const docs = await request<ApiCardDocument[]>(`/cards/${cardId}/documents`);
  return docs.map(mapDocument);
}

export async function uploadDocument(cardId: string, file: File, token: string): Promise<CardDocument> {
  const formData = new FormData();
  formData.append('file', file);
  const doc = await request<ApiCardDocument>(`/cards/${cardId}/documents`, { method: 'POST', body: formData }, token);
  return mapDocument(doc);
}

export function deleteDocument(cardId: string, documentId: string, token: string): Promise<void> {
  return request(`/cards/${cardId}/documents/${documentId}`, { method: 'DELETE' }, token);
}
