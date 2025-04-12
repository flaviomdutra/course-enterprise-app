import { BillingPublicApiProvider } from '@billingModule/integration/provider/public-api.provider';
import {
  AuthService,
  jwtConstants,
} from '@identityModule/core/service/authentication.service';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { BillingSubscriptionStatusApi } from '@sharedModules/integration/interface/billing-integration.interface';
import { DomainModuleIntegrationModule } from '@sharedModules/integration/interface/domain-module-integration.module';
import { PersistenceModule } from '@sharedModules/persistence/prisma/persistence.module';
import { UserManagementService } from './core/service/user-management.service';
import { AuthResolver } from './http/graphql/auth.resolver';
import { UserResolver } from './http/graphql/user.resolver';
import { BillingSubscriptionRepository } from './persistence/external/billing-subscription.repository';
import { UserRepository } from './persistence/repository/user.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60m' },
    }),
    PersistenceModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
    }),
    DomainModuleIntegrationModule,
  ],
  providers: [
    {
      provide: BillingSubscriptionStatusApi,
      useExisting: BillingPublicApiProvider,
    },
    AuthService,
    AuthResolver,
    UserResolver,
    UserManagementService,
    UserRepository,
    BillingSubscriptionRepository,
  ],
})
export class IdentityModule {}
