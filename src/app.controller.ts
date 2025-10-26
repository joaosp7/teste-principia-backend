import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiKeyGuard } from './guards/apiKey.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './items/entities/item.entity';
import { Repository } from 'typeorm';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(ApiKeyGuard)
  @Get('/test')
  test(){
    return 'its ok';
  }

  // @Get('/health')
  // async testHealth(){
  //   //await this.itemRepo.query('SELECT 1')
  //   return 'its ok'
  // }
}
