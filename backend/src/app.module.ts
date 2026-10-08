import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ClientsModule } from './modules/clients/clients.module';
import { BrandsModule } from './modules/brands/brands.module';
import { TeamsModule } from './modules/teams/teams.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    HealthModule,
    // Sprint-0 placeholders: modules exist so the team has a clear
    // home for Sprint-1 work, but expose no business logic yet.
    AuthenticationModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    ClientsModule,
    BrandsModule,
    TeamsModule,
  ],
})
export class AppModule {}
