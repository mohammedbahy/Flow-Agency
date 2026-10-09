import type { ProjectProgress, ReviewItem } from '../types/reviews.types';

/**
 * MOCK review workspace — UI preview only.
 * Approve/reject decisions stay in local component state and never
 * touch a backend. The Backend team wires the real review API in Sprint 2+.
 */
export const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: 'r1',
    title: 'Q4 Performance Creative Set — All Ad Variants',
    contentType: 'visual',
    client: 'Apex Finish',
    project: 'Q4 Performance Creative',
    submittedBy: 'Liam Designer',
    submittedAt: 'Oct 8, 2026 · 09:24',
    assetNote: '32 assets · proofing v3',
    status: 'pending',
    preview:
      'Hero variants in indigo/slate with product photography. Variant B uses the approved gradient band and updated wordmark lockup.',
  },
  {
    id: 'r2',
    title: 'Homepage hero copy',
    contentType: 'copy',
    client: 'Apex Finish',
    project: 'Website relaunch',
    submittedBy: 'Mia Member',
    submittedAt: 'Oct 8, 2026 · 08:02',
    assetNote: '1 document · proofing v2',
    status: 'pending',
    preview:
      'Headline: "Operate at the speed of ideas." Subcopy: "One workspace for clients, content and delivery." CTA: "Start your project".',
  },
  {
    id: 'r3',
    title: 'Thanksgiving Email Newsletter Series (3 templates)',
    contentType: 'campaign',
    client: 'Vama Retail',
    project: 'Holiday campaigns',
    submittedBy: 'Nora Writer',
    submittedAt: 'Oct 7, 2026 · 16:40',
    assetNote: '3 templates · proofing v1',
    status: 'pending',
    preview:
      'Early-access, story-driven, and last-call templates with subject lines, preheaders and mobile-first layouts.',
  },
  {
    id: 'r4',
    title: 'Autumn campaign visuals',
    contentType: 'visual',
    client: 'Globex',
    project: 'Autumn campaign',
    submittedBy: 'Liam Designer',
    submittedAt: 'Oct 7, 2026 · 11:15',
    assetNote: '6 assets · proofing v4',
    status: 'pending',
    preview:
      'Three hero variants plus cutdowns. Variant B pending final color pass before client presentation.',
  },
  {
    id: 'r5',
    title: 'Brand voice one-pager',
    contentType: 'copy',
    client: 'Lumina Health',
    project: 'Brand guidelines',
    submittedBy: 'Omar Strategist',
    submittedAt: 'Oct 6, 2026 · 15:18',
    assetNote: '1 document · final',
    status: 'approved',
    preview: 'One-page voice summary: confident, plain-spoken, never jargon-heavy.',
    feedback: 'Approved — matches the guideline draft from last week.',
  },
  {
    id: 'r6',
    title: 'Q4 social calendar',
    contentType: 'campaign',
    client: 'Umbrella',
    project: 'Social content Q4',
    submittedBy: 'Priya Producer',
    submittedAt: 'Oct 5, 2026 · 10:05',
    assetNote: '36 slots · proofing v2',
    status: 'rejected',
    preview: 'October–December posting calendar across three channels.',
    feedback: 'Please rework week 42 — captions repeat the September angle.',
  },
];

export const MOCK_PROJECT_PROGRESS: ProjectProgress[] = [
  { id: 'p1', name: 'Apex Mobile App 3.0', detail: 'Design · 18 of 32 reviewed', percent: 54 },
  { id: 'p2', name: 'Q4 Growth Performance', detail: 'Northwind Campaign · Delivery on track', percent: 72 },
  { id: 'p3', name: 'ROCC Trust Portal', detail: 'Content & QA · 9 of 12 approved', percent: 81 },
];
