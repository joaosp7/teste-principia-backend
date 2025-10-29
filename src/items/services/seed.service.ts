import { Injectable, Logger } from "@nestjs/common";
import { ItemsRepositoryImpl } from "../repository/implementations/postgresRepository";
import { ItemStatusEnum } from "../enums/itemStatus.enum";

@Injectable()
export class SeedService {

private readonly logger = new Logger(SeedService.name);


constructor(
  private readonly dbItem: ItemsRepositoryImpl
){}


async insert(n: number){
  const defaultDescription = 'This is the default Seed description';
  
  this.logger.log('Seeding the Database.');
  
  for (let i = 0; n >= i; i++ ){

    const randomNumber = Math.floor(Math.random() * 1000);

    await this.dbItem.create({
      name:`Seed Item Number ${String(randomNumber)}`,
      description: defaultDescription,
      status: !(randomNumber % 2) ? ItemStatusEnum.todo : ItemStatusEnum.doing
    });

  }

  this.logger.log('Seed process finished.');
  return
}
}