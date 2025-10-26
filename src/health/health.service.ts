import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import dataSourcePostgres, { dataSourcePostgresOptions } from "../db/postgres/datasource";

@Injectable()
export class HealthService {

  constructor(
    @InjectDataSource(dataSourcePostgres) private readonly db: DataSource,
  ){}

  
  async dbHealthCheck(){

    await this.db.query('SELECT 1');

    return {
      status: 'ok',
      infos : {
        typeOrm: 'ok',
        db: 'up'
      }
    };
  }
}