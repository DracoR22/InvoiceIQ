import { Module } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { PassportModule } from "@nestjs/passport";
import { ApiKeyStrategy } from "./strategies/api-key.strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Application } from "src/db/entities/application.entity";
import { ApiKey } from "src/db/entities/api-key.entity";

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([Application, ApiKey])],
  providers: [AuthService, ApiKeyStrategy],
  exports: [AuthService]
})
export class AuthModule {}

