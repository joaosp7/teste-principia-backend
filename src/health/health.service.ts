import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import dataSourcePostgres, { dataSourcePostgresOptions } from "../db/postgres/datasource";

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)

  constructor(
    @InjectDataSource(dataSourcePostgres) private readonly db: DataSource,
  ){}

  
  async dbHealthCheck(){

    try {
    this.logger.log('DB Health check received');
    await this.db.query('SELECT 1');
    this.logger.log('DB Health completed. Returning ok.');
    return {
      status: 'ok',
      infos : {
        typeOrm: 'ok',
        db: 'up'
      }
    };  
    } catch (error) {
      this.logger.error(`Error while checking DB Health. ${error?.message}`);
      throw error

    }
    
  }
}