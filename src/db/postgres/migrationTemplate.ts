import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationXPTO implements MigrationInterface {
    name = 'MIGRATIONXPTO'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tableName" ()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tableName"`);
    }

}
