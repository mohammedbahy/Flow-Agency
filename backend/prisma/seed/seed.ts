/**
 * Development seed — reads JSON template files and upserts them via Prisma.
 *
 * Idempotent: safe to run repeatedly (`npm run prisma:seed`).
 * - Permissions / Roles / Users are upserted by their unique fields.
 * - clients/brands/teams JSON files are template placeholders for future
 *   sprints (their tables do not exist yet) and are only validated/logged.
 *
 * JSON files are NOT the database — PostgreSQL (via Docker) is.
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const DATA_DIR = path.join(__dirname, 'data');

function readJson<T>(file: string): T {
  const full = path.join(DATA_DIR, file);
  return JSON.parse(fs.readFileSync(full, 'utf-8')) as T;
}

interface PermissionSeed {
  key: string;
  description?: string;
}
interface RoleSeed {
  name: string;
  description?: string;
}
interface UserSeed {
  email: string;
  firstName?: string;
  lastName?: string;
  passwordHash: string;
  roles: string[];
}

// Role -> permission-key mapping for dev data.
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'users.read',
    'users.write',
    'roles.read',
    'roles.write',
    'clients.read',
    'clients.write',
    'brands.read',
    'brands.write',
    'teams.read',
    'teams.write',
  ],
  manager: ['clients.read', 'clients.write', 'brands.read', 'brands.write', 'teams.read'],
  member: ['clients.read', 'brands.read', 'teams.read'],
};

async function main() {
  const permissions = readJson<PermissionSeed[]>('permissions.json');
  const roles = readJson<RoleSeed[]>('roles.json');
  const users = readJson<UserSeed[]>('users.json');

  // Validate future-sprint placeholders exist and are parseable (no DB writes yet).
  for (const file of ['clients.json', 'brands.json', 'teams.json']) {
    const rows = readJson<unknown[]>(file);
    console.log(`seed: ${file} — ${rows.length} template row(s) (no table yet, skipped)`);
  }

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: { description: p.description },
      create: { key: p.key, description: p.description },
    });
  }
  console.log(`seed: upserted ${permissions.length} permissions`);

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description },
    });
  }
  console.log(`seed: upserted ${roles.length} roles`);

  // Link roles -> permissions (delete-then-create keeps reruns idempotent).
  for (const r of roles) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: r.name } });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    const keys = ROLE_PERMISSIONS[r.name] ?? [];
    for (const key of keys) {
      const perm = await prisma.permission.findUnique({ where: { key } });
      if (!perm) continue;
      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: perm.id },
      });
    }
  }
  console.log('seed: linked role permissions');

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash: u.passwordHash,
        isActive: true,
      },
      create: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash: u.passwordHash,
      },
    });
    // Reset role links for idempotency, then re-assign.
    await prisma.userRole.deleteMany({ where: { userId: user.id } });
    for (const roleName of u.roles) {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) continue;
      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id },
      });
    }
  }
  console.log(`seed: upserted ${users.length} users (+ role links)`);

  console.log('seed: done');
}

main()
  .catch((e) => {
    console.error('seed: failed', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
