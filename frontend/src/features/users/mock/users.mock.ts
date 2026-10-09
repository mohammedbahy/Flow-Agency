import type {
  AuditEntry,
  ClientUser,
  MockUser,
  RoleEntry,
} from '../types/users.types';

/**
 * MOCK workspace directory — UI preview only.
 * All edits stay in local component state and are never persisted.
 * The Backend team replaces these imports with API calls in Sprint 1/2.
 */
export const MOCK_USERS: MockUser[] = [
  {
    id: 'u1', name: 'Elena Rostova', email: 'elena.rostova@nexusagency.co',
    role: 'Super Admin', clients: ['All Clients'], team: 'Executive Team',
    twoFactor: true, lastActive: 'Just now', status: 'active',
  },
  {
    id: 'u2', name: 'Julian Vane', email: 'julian.vane@nexusagency.co',
    role: 'Account Manager', clients: ['Apex Finish', 'Lumina Health'], team: 'Creative & Design',
    twoFactor: true, lastActive: '22 mins ago', status: 'active',
  },
  {
    id: 'u3', name: 'Amara Kalu', email: 'amara.kalu@nexusagency.co',
    role: 'Senior Designer', clients: ['Nordic Squad', 'Vama Retail'], team: 'Creative & Design',
    twoFactor: true, lastActive: '2 hours ago', status: 'active',
  },
  {
    id: 'u4', name: 'Marcus Chen', email: 'marcus.chen@nexusagency.co',
    role: 'Copywriter', clients: ['Lumina Health'], team: 'Content Studio',
    twoFactor: true, lastActive: 'Never (Invited)', status: 'invited',
  },
  {
    id: 'u5', name: 'Svetlana Belova', email: 'svetlana.b@apexfinish.com',
    role: 'Client Reviewer', clients: ['Apex Finish (Client)'], team: 'Executive Team',
    twoFactor: false, lastActive: 'Yesterday, 4:15 PM', status: 'active',
  },
  {
    id: 'u6', name: 'Devonte Gray', email: 'devonte.gray@nexusagency.co',
    role: 'Copywriter', clients: ['Unassigned (Deprovisioned)'], team: 'Content Studio',
    twoFactor: false, lastActive: '14 days ago', status: 'suspended',
  },
  {
    id: 'u7', name: 'Maya Lin', email: 'maya.lin@nexusagency.co',
    role: 'Account Manager', clients: ['Lumina Health', 'Vama Retail'], team: 'Media Buying',
    twoFactor: true, lastActive: '1 hour ago', status: 'active',
  },
  {
    id: 'u8', name: 'David Park', email: 'david.park@nexusagency.co',
    role: 'Senior Designer', clients: ['Vama Retail'], team: 'Creative & Design',
    twoFactor: true, lastActive: '3 hours ago', status: 'active',
  },
];

export const MOCK_CLIENT_USERS: ClientUser[] = [
  { id: 'c1', name: 'Svetlana Belova', email: 'svetlana.b@apexfinish.com', client: 'Apex Finish', lastActive: 'Yesterday, 4:15 PM', status: 'active' },
  { id: 'c2', name: 'Tom Becker', email: 'tom.becker@luminahealth.com', client: 'Lumina Health', lastActive: '2 days ago', status: 'active' },
  { id: 'c3', name: 'Rina Shah', email: 'rina.shah@vamaretail.com', client: 'Vama Retail', lastActive: 'Never (Invited)', status: 'invited' },
];

export const MOCK_ROLES: RoleEntry[] = [
  { id: 'r1', name: 'Super Admin', members: 1, permissions: ['users.write', 'roles.write', 'billing.read', 'audit.read'] },
  { id: 'r2', name: 'Account Manager', members: 2, permissions: ['clients.write', 'projects.write', 'reviews.read'] },
  { id: 'r3', name: 'Senior Designer', members: 2, permissions: ['content.write', 'reviews.read'] },
  { id: 'r4', name: 'Copywriter', members: 2, permissions: ['content.write'] },
  { id: 'r5', name: 'Client Reviewer', members: 1, permissions: ['reviews.read', 'reviews.comment'] },
];

export const MOCK_AUDIT: AuditEntry[] = [
  { id: 'l1', actor: 'Elena Rostova', action: 'Approved Brand voice one-pager for Lumina Health.', time: '34 min ago' },
  { id: 'l2', actor: 'Julian Vane', action: 'Invited marcus.chen@nexusagency.co as Copywriter.', time: '2 hrs ago' },
  { id: 'l3', actor: 'System', action: 'Enforced 2FA on 6 of 8 team accounts.', time: 'Yesterday' },
  { id: 'l4', actor: 'Elena Rostova', action: 'Suspended devonte.gray@nexusagency.co (deprovisioned).', time: '14 days ago' },
];
