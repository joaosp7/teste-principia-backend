import { Injectable } from "@nestjs/common";
import { CreateItemDto } from "../../dto/create-item.dto";
import { UpdateItemDto } from "../../dto/update-item.dto";
import { Item } from "../../entities/item.entity";
import { ItemsRepository } from "../repository.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

export type FindAllParams = {
  limit: number,
  page: number,
  search?: string,
  order: 'ASC'| 'DESC',
  sort: 'createdAt' | 'updatedAt'| 'name',

}
@Injectable()
export class ItemsRepositoryImpl implements ItemsRepository {

  constructor(
    @InjectRepository(Item) private readonly dbItem: Repository<Item> 
  ){}

  async create(itemDto: CreateItemDto): Promise<Item> {
    try {
    const newItem = this.dbItem.create(itemDto);

    const ret = await this.dbItem.save(newItem);
    console.log('newItem (presave)', newItem);
    console.log('newItem (posSave)', ret)

    return ret  
    } catch (error) {
      console.log('Error during creation');
      throw error;
    }
    
  }
  async update(updateDto: UpdateItemDto, id:string): Promise<Item|null> {

    try {
    const newItem = await this.dbItem.update(id, updateDto)

    console.log('NewItem Updated: ', newItem);

    const updatedItem = await this.dbItem.findOneBy({id});
    return updatedItem;  
    } catch (error) {
      console.log('Error during update')
      throw error
    }
    

  }
  async getAll({limit, page, search, order, sort}: FindAllParams): Promise<any> {

    try {
    
    const query = this.dbItem.createQueryBuilder('item')
    .skip((page - 1) * limit ).take(limit)

    if(search){
      query.where('item.name ILIKE :search', { search: `%${search}%` });
    }

    query.orderBy(`item.${sort}`, order)

    const [data, total] = await query.getManyAndCount();

    const totalPages = Math.ceil(total/limit)
    return {
      data,
      metadata: {
        page,
        limit,
        totalItems: total,
        totalPages,
        nextPage: page + 1 > totalPages ? null : page + 1,
        previousPage: page - 1 < 1 ? null : page - 1,
        sort,
        order  

      }
    }

      
    } catch (error) {
      console.log('Error during getAll');
      throw error;
    }
    


  }
  async getById(id: string): Promise<Item | null> {
    try {
    const itemFound = await this.dbItem.findOneBy({id});
    console.log('getById with id', id, 'result', itemFound);
    return itemFound;  
    } catch (error) {
      console.log('Error during getbyId');
      throw error
    }
    
  }
  async deleteById(id: string): Promise<null> {

    try {
    await this.dbItem.delete({id})
    console.log('Item with given id was deleted.', id)
    return null;  
    } catch (error) {
      console.log('Error during deletion')
      throw error
    }
    
  }

}