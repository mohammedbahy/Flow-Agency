import type { MockClient } from '../types/clients.types';

/** MOCK client accounts — UI preview only. */
export const MOCK_CLIENTS: MockClient[] = [
  { id: 'c1', name: 'Apex Finish', contact: 'Sarah Miller • sarah@apexfinish.co', retainer: '$48k/mo', projects: 9, status: 'active' },
  { id: 'c2', name: 'Nexus Retail', contact: 'James Carter • james@nexusretail.co', retainer: '$36k/mo', projects: 12, status: 'active' },
  { id: 'c3', name: 'Orbit SaaS', contact: 'Lena Kova • lena@orbitsaas.io', retainer: '$29k/mo', projects: 7, status: 'at-risk' },
  { id: 'c4', name: 'Lumen Health', contact: 'Omar Farouk • omar@lumenhealth.co', retainer: '$22k/mo', projects: 5, status: 'paused' },
];
