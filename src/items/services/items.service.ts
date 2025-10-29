import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemsRepositoryImpl } from '../repository/implementations/postgresRepository';
import { ParamItemGetRouteDto } from '../dto/param-item-get-route.dto';

@Injectable()
export class ItemsService {

  private readonly logger = new Logger(ItemsService.name)

  constructor(private readonly itemsRepo: ItemsRepositoryImpl ){}

  async createNewItem(createItemDto: CreateItemDto) {
    
    return await this.itemsRepo.create(createItemDto);
  }

  async findAllItems(input: ParamItemGetRouteDto) {
    
    return await this.itemsRepo.getAll({
      limit: input?.limit ?? 10,
      page: input?.page ?? 1,
      search: input?.search ?? undefined,
      order: input?.order ?? 'DESC',
      sort: input?.sort ?? 'createdAt'
    })
  }

  async findOneItem(id: string) {
    
    const itemFound = await this.itemsRepo.getById(id);

    if(!itemFound) {
      this.logger.log('findOneItem was called but Item does not exist');
      throw new NotFoundException(`Item with id:${id} not found.`);

    };

    return itemFound;
  }

  async updateItem(id: string, updateItemDto: UpdateItemDto) {

    const itemFound = await this.itemsRepo.getById(id);

    if (!itemFound) {
      this.logger.log('updateItem was called but Item does not exist')
      throw new NotFoundException(`Item with id:${id} not found.`);
    }

    const updatedItem = await this.itemsRepo.update(updateItemDto, id);

    return updatedItem;
  }

  async removeItem(id: string) {
    
    const itemFound = await this.itemsRepo.getById(id);

    if(!itemFound){
      this.logger.log('removeItem was called but Items does not exist.');
      throw new NotFoundException(`Item with id:${id} not found.`);
    }

    await this.itemsRepo.deleteById(id);

    return;

  }
}
