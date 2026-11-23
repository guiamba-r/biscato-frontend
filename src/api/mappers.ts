import type {
  ApiPortfolioWork,
  ApiProposal,
  ApiProviderDetail,
  ApiProviderSummary,
  ApiRequest,
  ApiRequestStatus,
  ApiReview,
} from './types';
import type {
  PortfolioWork,
  Proposal,
  ProviderProfile,
  ProviderReview,
  ProvinceName,
  ServiceCategoryId,
  ServiceRequest,
} from '../types/biscato';

type CategoryId = Exclude<ServiceCategoryId, 'all'>;
type VisibleApiRequest = ApiRequest & { status: Exclude<ApiRequestStatus, 'cancelled'> };

export interface MappedProposal {
  proposal: Proposal;
  provider: ProviderProfile;
}

export function mapPortfolioWork(work: ApiPortfolioWork): PortfolioWork {
  return {
    id: work.id,
    title: work.title,
    location: work.location,
    completedAt: work.completedAt,
    costMT: work.costMT,
    tone: work.tone,
  };
}

export function mapReview(review: ApiReview): ProviderReview {
  return {
    id: review.id,
    clientName: review.clientName,
    rating: review.rating,
    dateLabel: review.dateLabel,
    comment: review.comment,
    serviceTitle: review.serviceTitle,
  };
}

export function mapProviderSummary(provider: ApiProviderSummary): ProviderProfile {
  return {
    id: provider.id,
    name: provider.name,
    initials: provider.initials,
    specialty: provider.specialty,
    category: provider.category as CategoryId,
    province: provider.province as ProvinceName,
    neighborhood: provider.neighborhood,
    coordinates: Number.isFinite(provider.latitude) && Number.isFinite(provider.longitude)
      ? { latitude: provider.latitude as number, longitude: provider.longitude as number }
      : null,
    isAvailable: provider.isAvailable,
    rating: provider.rating,
    reviewsCount: provider.reviewsCount,
    completedJobs: provider.completedJobs,
    onTimeRate: provider.onTimeRate,
    yearsExperience: provider.yearsExperience,
    biVerified: provider.identityVerified,
    biscatoWarranty: provider.biscatoWarranty,
    subscriptionState: provider.subscriptionState,
    hourlyOrBaseMT: provider.hourlyOrBaseMT,
    bio: provider.bio,
    portfolio: [],
    reviews: [],
  };
}

export function mapProviderDetail(provider: ApiProviderDetail): ProviderProfile {
  return {
    ...mapProviderSummary(provider),
    toleranceDaysRemaining: provider.toleranceDaysRemaining,
    creditsBalance: provider.creditsBalance,
    portfolio: provider.portfolio.map(mapPortfolioWork),
    reviews: provider.reviews.map(mapReview),
  };
}

function isVisibleRequest(request: ApiRequest): request is VisibleApiRequest {
  return request.status !== 'cancelled';
}

function mapRequest(request: VisibleApiRequest): ServiceRequest {
  return {
    id: request.id,
    title: request.title,
    category: request.category as CategoryId,
    province: request.province as ProvinceName,
    neighborhood: request.neighborhood,
    distanceKm: request.distanceKm,
    urgency: request.urgency,
    clientVerified: request.clientVerified,
    publishedLabel: request.publishedLabel,
    budgetMinMT: request.budgetMinMT,
    budgetMaxMT: request.budgetMaxMT,
    description: request.description,
    status: request.status,
    targetProviderId: request.targetProviderId,
    proposalsCount: request.proposalsCount,
  };
}

export function mapRequests(requests: ApiRequest[]): ServiceRequest[] {
  return requests.filter(isVisibleRequest).map(mapRequest);
}

export function mapProposal(proposal: ApiProposal): MappedProposal {
  return {
    proposal: {
      id: proposal.id,
      requestId: proposal.requestId,
      providerId: proposal.providerId,
      priceMT: proposal.priceMT,
      deadlineDays: proposal.deadlineDays,
      note: proposal.note,
      isBestMatch: proposal.isBestMatch,
      createdAt: proposal.createdAtLabel,
    },
    provider: mapProviderSummary(proposal.provider),
  };
}
