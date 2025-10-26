import { CreateItemDto } from "../dto/create-item.dto";
import { UpdateItemDto } from "../dto/update-item.dto";
import { Item } from "../entities/item.entity";

export interface ItemsRepository {

   create(itemDto: CreateItemDto): Promise<Item>

   update(updateDto: UpdateItemDto): Promise<Item>

   getAll(): Promise<Item[]>

   getById(id:string): Promise<Item>

   deleteById(id: string): Promise<null>

}