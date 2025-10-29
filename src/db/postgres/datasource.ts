import { DataSource, DataSourceOptions } from "typeorm";
import { env } from "../../env/env";

export const dataSourcePostgresOptions : DataSourceOptions = {
  type: 'postgres',
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  synchronize: false,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/postgres/migrations/*.js'],
  logging: ['error'],
}


const dataSourcePostgres = new DataSource(dataSourcePostgresOptions);

export default dataSourcePostgres;