import { Injectable } from '@nestjs/common';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemsRepositoryImpl } from '../repository/implementations/postgresRepository';
import { ParamItemGetRouteDto } from '../dto/param-item-get-route.dto';

@Injectable()
export class ItemsService {

  constructor(private readonly itemsRepo: ItemsRepositoryImpl ){}

  async createNewItem(createItemDto: CreateItemDto) {
    console.log('createNewItem');
    return await this.itemsRepo.create(createItemDto);
  }

  async findAllItems(input: ParamItemGetRouteDto) {
    console.log('findAllItems');
    return await this.itemsRepo.getAll({
      limit: input?.limit ?? 10,
      page: input?.page ?? 1,
      search: input?.search ?? undefined,
      order: input?.order ?? 'DESC',
      sort: input?.sort ?? 'createdAt'
    })
  }

  async findOneItem(id: string) {
    console.log('findOneItem');
    const itemFound = await this.itemsRepo.getById(id);

    if(!itemFound) {
      console.log('No item was found with given id');
      return null;

    };

    return itemFound;
  }

  async updateItem(id: string, updateItemDto: UpdateItemDto) {
    console.log('updateItem');
    const itemFound = await this.itemsRepo.getById(id);
    if (!itemFound) {
      console.log('Want update but item does not exist')
      return null
    }

    const updatedItem = await this.itemsRepo.update(updateItemDto, id);

    return updatedItem;
  }

  async removeItem(id: string) {
    console.log('removeItem');

    const itemFound = await this.itemsRepo.getById(id);

    if(!itemFound){
      console.log('Want delete but no item was found');
      return null;
    }

    await this.itemsRepo.deleteById(id);

    return;

  }
}
