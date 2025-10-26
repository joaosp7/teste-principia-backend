import { Module } from '@nestjs/common';
import { ItemsController } from './controllers/items.controller';
import { ItemsService } from './services/items.service';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [TypeOrmModule.forFeature()],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
