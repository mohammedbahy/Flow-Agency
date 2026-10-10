import type { MockClient } from '../types/clients.types';

/**
 * MOCK client directory — UI preview only.
 * Create/edit actions update local component state and are never persisted.
 * The Backend team replaces these imports with API calls in a later sprint.
 */
export const MOCK_CLIENTS: MockClient[] = [
  {
    id: 'cl1', name: 'Apex Finish', industry: 'Automotive', contactName: 'Svetlana Belova',
    contactEmail: 'svetlana.b@apexfinish.com', brands: ['Apex Finish', 'Apex Performance'],
    activeProjects: 4, status: 'active',
  },
  {
    id: 'cl2', name: 'Lumina Health', industry: 'Healthcare', contactName: 'Tom Becker',
    contactEmail: 'tom.becker@luminahealth.com', brands: ['Lumina Health'],
    activeProjects: 3, status: 'active',
  },
  {
    id: 'cl3', name: 'Globex', industry: 'Technology', contactName: 'Hank Scorpio',
    contactEmail: 'hank.scorpio@globex.com', brands: ['Globex', 'Globex Labs'],
    activeProjects: 2, status: 'at-risk',
  },
  {
    id: 'cl4', name: 'Vama Retail', industry: 'Retail', contactName: 'Rina Shah',
    contactEmail: 'rina.shah@vamaretail.com', brands: ['Vama Retail'],
    activeProjects: 3, status: 'active',
  },
  {
    id: 'cl5', name: 'Initech', industry: 'Software', contactName: 'Peter Gibbons',
    contactEmail: 'peter.gibbons@initech.com', brands: ['Initech'],
    activeProjects: 1, status: 'paused',
  },
  {
    id: 'cl6', name: 'Hooli', industry: 'Technology', contactName: 'Gavin Belson',
    contactEmail: 'gavin.belson@hooli.com', brands: ['Hooli', 'Hooli XYZ'],
    activeProjects: 2, status: 'active',
  },
  {
    id: 'cl7', name: 'Umbrella', industry: 'Pharma', contactName: 'Albert Wesker',
    contactEmail: 'albert.wesker@umbrella.com', brands: ['Umbrella'],
    activeProjects: 1, status: 'at-risk',
  },
];
