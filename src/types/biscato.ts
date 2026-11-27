export type AppTab = 'home' | 'explore' | 'services' | 'opportunities' | 'proposals' | 'messages' | 'support' | 'profile' | 'escrow' | 'business' | 'auth';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export type UserRole = 'client' | 'provider';

export type ServiceCategoryId =
  | 'all'
  | 'canalizacao'
  | 'eletricidade'
  | 'construcao'
  | 'carpintaria'
  | 'pintura'
  | 'mecanica'
  | 'mudancas'
  | 'calcados';

export type ProvinceName =
  | 'Todas as Províncias'
  | 'Cidade de Maputo'
  | 'Maputo Província (Matola)'
  | 'Gaza'
  | 'Inhambane'
  | 'Sofala'
  | 'Manica'
  | 'Tete'
  | 'Nampula'
  | 'Niassa'
  | 'Cabo Delgado'
  | 'Zambézia';

export type ProviderSubscriptionState = 'active' | 'tolerance_30d' | 'suspended';

export type ClientPlanState = 'free_trial_30d' | 'monthly_client' | 'enterprise_condo';

export type PaymentMethodId = 'mpesa' | 'emola';

export type EscrowStage = 'awaiting_payment' | 'funds_held' | 'in_execution' | 'provider_completed' | 'released' | 'disputed';

export interface ServiceCategory {
  id: Exclude<ServiceCategoryId, 'all'>;
  label: string;
  shortLabel: string;
  averageRangeMT: string;
  accentBg: string;
  accentText: string;
}

export interface PortfolioWork {
  id: string;
  title: string;
  location: string;
  completedAt: string;
  costMT: number;
  tone: 'emerald' | 'amber' | 'slate';
}

export interface ProviderReview {
  id: string;
  clientName: string;
  rating: number;
  dateLabel: string;
  comment: string;
  serviceTitle: string;
}

export interface ProviderProfile {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  category: Exclude<ServiceCategoryId, 'all'>;
  province: ProvinceName;
  neighborhood: string;
  coordinates?: GeoCoordinates | null;
  isAvailable?: boolean;
  rating: number;
  reviewsCount: number;
  completedJobs: number;
  onTimeRate: number;
  yearsExperience: number;
  biVerified: boolean;
  biscatoWarranty: boolean;
  subscriptionState: ProviderSubscriptionState;
  toleranceDaysRemaining?: number;
  creditsBalance?: number;
  hourlyOrBaseMT: number;
  bio: string;
  portfolio: PortfolioWork[];
  reviews: ProviderReview[];
}

export interface ServiceRequest {
  id: string;
  clientId?: string;
  acceptedProposalId?: string;
  targetProviderId?: string | null;
  proposalsCount?: number;
  title: string;
  category: Exclude<ServiceCategoryId, 'all'>;
  province: ProvinceName;
  neighborhood: string;
  distanceKm: number | null;
  urgency: 'Urgente' | 'Esta semana' | 'Flexível';
  clientVerified: boolean;
  publishedLabel: string;
  budgetMinMT: number;
  budgetMaxMT: number;
  description: string;
  status: 'open' | 'in_escrow' | 'completed';
}

export interface ProviderServiceListing {
  id: string;
  providerId: string;
  providerName: string;
  providerInitials: string;
  title: string;
  category: Exclude<ServiceCategoryId, 'all'>;
  province: ProvinceName;
  neighborhood: string;
  priceMT: number;
  description: string;
  publishedAt: string;
  status: 'active' | 'paused';
}

export interface Proposal {
  id: string;
  requestId: string;
  providerId: string;
  priceMT: number;
  deadlineDays: number;
  note: string;
  isBestMatch?: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'provider' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  requestId: string;
  requestTitle: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface EscrowTransaction {
  id: string;
  requestId: string;
  proposalId: string;
  providerId: string;
  serviceTitle: string;
  amountMT: number;
  paymentMethod: PaymentMethodId;
  stage: EscrowStage;
  heldAt?: string;
  expectedCompletion?: string;
  releasedAt?: string;
  appliedFeePercent: number;
  feeReason: string;
  warrantyCoveragePercent: number;
  creditsEarnedOnRelease: number;
  disputeReason?: string;
  clientRating?: number;
  clientReviewText?: string;
  messages: ChatMessage[];
}

export interface TeamDecision {
  person: string;
  team: string;
  role: string;
  task: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface BusinessCanvasBlock {
  id: string;
  title: string;
  items: string[];
}

export interface CompetitorEntry {
  name: string;
  region: string;
  strengths: string;
  gapsInMozambique: string;
  biscatoAdvantage: string;
}
