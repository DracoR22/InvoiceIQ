import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { HeaderAPIKeyStrategy } from "passport-headerapikey"
import { AuthService } from "../services/auth.service";

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'apikey') {
  constructor(
    private readonly authService: AuthService
  ) {
    super({ header: 'X-API-KEY', prefix: '' }, true, async (apiKey: string, done: (err: Error | unknown, verified?: boolean) => void) => {
        const isValid = await this.authService.validateApiKey(apiKey);
        return isValid ? done(null, true) : done(new UnauthorizedException('Invalid API Key'));
    });
  }
}
