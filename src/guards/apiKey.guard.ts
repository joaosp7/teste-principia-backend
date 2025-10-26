import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { env } from "../env/env";

@Injectable()
export class ApiKeyGuard implements CanActivate{
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest();

    const receivedApiKey = request?.headers['authorization'] ?? ''
    
    return receivedApiKey === env.APP_SECRET
  }
}