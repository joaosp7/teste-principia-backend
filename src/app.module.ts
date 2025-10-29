import { Module } from '@nestjs/common';
import { ItemsModule } from './items/items.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourcePostgresOptions } from './db/postgres/datasource';
import { HealthModule } from './health/heath.module';

@Module({
  imports: [ItemsModule,
    TypeOrmModule.forRoot(dataSourcePostgresOptions),
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
