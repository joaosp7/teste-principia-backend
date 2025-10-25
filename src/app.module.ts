import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './items/items.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourcePostgresOptions } from './db/postgres/datasource';

@Module({
  imports: [ItemsModule,
    TypeOrmModule.forRoot(dataSourcePostgresOptions)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
