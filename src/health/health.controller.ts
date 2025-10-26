import { Controller, Get, UseGuards } from "@nestjs/common";
import { HealthService } from "./health.service";
import { ApiKeyGuard } from "../guards/apiKey.guard";



@Controller()
export class HealthController{
  constructor(private readonly healthService: HealthService){}


  //@UseGuards(ApiKeyGuard)
  @Get('/health')
  async checkHealth(){
    return await this.healthService.dbHealthCheck();
  }

}