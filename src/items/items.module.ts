import { Module } from '@nestjs/common';
import { ItemsController } from './controllers/items.controller';
import { ItemsService } from './services/items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsRepositoryImpl } from './repository/implementations/postgresRepository';
import { Item } from './entities/item.entity';
import { SeedService } from './services/seed.service';


@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  controllers: [ItemsController],
  providers: [ItemsService, ItemsRepositoryImpl, SeedService],
})
export class ItemsModule {}
