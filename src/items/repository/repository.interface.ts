import { CreateItemDto } from "../dto/create-item.dto";
import { UpdateItemDto } from "../dto/update-item.dto";
import { Item } from "../entities/item.entity";

export interface ItemsRepository {

   create(itemDto: CreateItemDto): Promise<Item>

   update(updateDto: UpdateItemDto, id:string): Promise<Item|null>

   getAll( filters: any): Promise<any>

   getById(id:string): Promise<Item | null>

   deleteById(id: string): Promise<null>

}