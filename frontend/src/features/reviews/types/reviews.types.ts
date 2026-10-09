export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type ReviewContentType = 'copy' | 'visual' | 'campaign';

export interface ReviewItem {
  id: string;
  title: string;
  contentType: ReviewContentType;
  client: string;
  project: string;
  submittedBy: string;
  submittedAt: string;
  assetNote: string;
  status: ReviewStatus;
  preview: string;
  feedback?: string;
}

export interface ProjectProgress {
  id: string;
  name: string;
  detail: string;
  percent: number;
}

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: 'Awaiting review',
  approved: 'Approved',
  rejected: 'Needs changes',
};

export const REVIEW_TYPE_LABEL: Record<ReviewContentType, string> = {
  copy: 'Copy',
  visual: 'Visual',
  campaign: 'Campaign',
};
