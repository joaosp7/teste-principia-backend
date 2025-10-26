import { Injectable } from "@nestjs/common";
import { CreateItemDto } from "../../dto/create-item.dto";
import { UpdateItemDto } from "../../dto/update-item.dto";
import { Item } from "../../entities/item.entity";
import { ItemsRepository } from "../repository.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ItemsRepositoryImpl implements ItemsRepository {

  constructor(
    @InjectRepository(Item) private readonly dbItem: Repository<Item> 
  ){}

  create(itemDto: CreateItemDto): Promise<Item> {
    this.dbItem.countBy('' as any as Item[])
    console.log(itemDto)
    
    throw new Error("Method not implemented.");
  }
  update(updateDto: UpdateItemDto): Promise<Item> {
    console.log(updateDto)
    throw new Error("Method not implemented.");
  }
  getAll(): Promise<Item[]> {
    throw new Error("Method not implemented.");
  }
  getById(id: string): Promise<Item> {
    console.log(id)
    throw new Error("Method not implemented.");
  }
  deleteById(id: string): Promise<null> {
    console.log(id)
    throw new Error("Method not implemented.");
  }

}