import { Controller, Get, Logger, UseFilters, UseGuards, UseInterceptors } from "@nestjs/common";
import { HealthService } from "./health.service";
import { ApiKeyGuard } from "../guards/apiKey.guard";
import { ResponseInterceptor } from "../interceptors/response.interceptor";
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ExceptionGeneralFilter } from "../filters/exception.filters";



@ApiTags('Health')
@ApiSecurity('api-key')
@UseFilters(ExceptionGeneralFilter)
@Controller('health')
@UseInterceptors(ResponseInterceptor)
export class HealthController{

  constructor(private readonly healthService: HealthService){}


  @ApiOperation({summary: 'ping the database to check connection'})
  @UseGuards(ApiKeyGuard)
  @Get('/db')
  async checkHealth(){
    return await this.healthService.dbHealthCheck();
  }

}