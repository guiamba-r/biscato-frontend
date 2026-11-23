export interface ApiPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string;
  details?: string[];
  path: string;
  timestamp: string;
}

export type ApiUserRole = 'client' | 'provider' | 'admin';
export type ApiClientPlanState = 'free_trial_30d' | 'monthly_client' | 'enterprise_condo';

export interface ApiAuthUser {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  initials: string;
  role: ApiUserRole;
  identityVerified: boolean;
  clientPlanState: ApiClientPlanState | null;
  freeTrialEndsAt: string | null;
  providerId: string | null;
  createdAt: string;
}

export interface ApiSession {
  accessToken: string;
  tokenType: 'Bearer';
  user: ApiAuthUser;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterClientBody {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'client';
}

export interface RegisterProviderBody {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'provider';
  specialty: string;
  category: string;
  province: string;
  neighborhood: string;
  yearsExperience: number;
  bio: string;
  baseRateMT: number;
}

export type RegisterBody = RegisterClientBody | RegisterProviderBody;

export interface ApiProvince {
  id: string;
  name: string;
}

export interface ApiCategory {
  id: string;
  label: string;
  shortLabel: string;
  averageRangeMinMT: number;
  averageRangeMaxMT: number;
}

export type ApiSubscriptionState = 'active' | 'tolerance_30d' | 'suspended';

export interface ApiProviderSummary {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  category: string;
  province: string;
  neighborhood: string;
  latitude?: number | null;
  longitude?: number | null;
  isAvailable?: boolean;
  bio: string;
  yearsExperience: number;
  hourlyOrBaseMT: number;
  rating: number;
  reviewsCount: number;
  completedJobs: number;
  onTimeRate: number;
  identityVerified: boolean;
  biscatoWarranty: boolean;
  subscriptionState: ApiSubscriptionState;
}

export interface ApiPortfolioWork {
  id: string;
  title: string;
  location: string;
  completedAt: string;
  costMT: number;
  tone: 'emerald' | 'amber' | 'slate';
}

export interface ApiReview {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  serviceTitle: string;
  createdAt: string;
  dateLabel: string;
}

export interface ApiProviderDetail extends ApiProviderSummary {
  toleranceDaysRemaining?: number;
  creditsBalance?: number;
  portfolio: ApiPortfolioWork[];
  reviews: ApiReview[];
}

export type ApiRequestStatus = 'open' | 'in_escrow' | 'completed' | 'cancelled';
export type ApiUrgency = 'Urgente' | 'Esta semana' | 'Flexível';

export interface ApiRequest {
  id: string;
  title: string;
  category: string;
  province: string;
  neighborhood: string;
  urgency: ApiUrgency;
  budgetMinMT: number;
  budgetMaxMT: number;
  description: string;
  status: ApiRequestStatus;
  publishedAt: string;
  publishedLabel: string;
  distanceKm: number | null;
  clientVerified: boolean;
  proposalsCount: number;
  targetProviderId: string | null;
}

export type ApiProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface ApiProposal {
  id: string;
  requestId: string;
  providerId: string;
  priceMT: number;
  deadlineDays: number;
  note: string;
  status: ApiProposalStatus;
  createdAt: string;
  createdAtLabel: string;
  isBestMatch: boolean;
  provider: ApiProviderSummary;
}

export interface ProviderListParams {
  q?: string;
  category?: string;
  province?: string;
  neighborhood?: string;
  minRate?: number;
  maxRate?: number;
  page?: number;
  pageSize?: number;
}

export interface NeighborhoodsParams {
  province?: string;
}

export interface RequestListParams {
  q?: string;
  category?: string;
  province?: string;
  status?: ApiRequestStatus;
  mine?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateRequestBody {
  title: string;
  category: string;
  province: string;
  neighborhood: string;
  urgency: ApiUrgency;
  budgetMinMT: number;
  budgetMaxMT: number;
  description: string;
  targetProviderId?: string;
}

export interface CreateProposalBody {
  priceMT: number;
  deadlineDays: number;
  note: string;
}

export interface UpdateProviderProfileBody {
  specialty?: string;
  category?: string;
  province?: string;
  neighborhood?: string;
  yearsExperience?: number;
  bio?: string;
  hourlyOrBaseMT?: number;
}
