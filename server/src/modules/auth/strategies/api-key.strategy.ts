import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { HeaderAPIKeyStrategy } from "passport-headerapikey"
import { AuthService } from "../services/auth.service";
import { ISOLogger } from "src/modules/logger/services/iso-logger.service";

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'apikey') {
  constructor(
    private readonly authService: AuthService,
    private logger: ISOLogger
  ) {
    logger.setContext(ApiKeyStrategy.name)
    super({ header: 'X-API-KEY', prefix: '' }, true, async (apiKey: string, done: (err: Error | unknown, verified?: boolean) => void) => {
        const isValid = await this.authService.validateApiKey(apiKey);

        if (isValid) {
          return done(null, true)
        } else {
          this.logger.warn('Invalid API key')
          return done(new UnauthorizedException(), false)
        }
    });
  }
}
