/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ItemStatusEnum } from "../enums/itemStatus.enum";


export class CreateItemDto {

  @IsString()
  @IsNotEmpty()
  name: string

  @IsEnum(ItemStatusEnum)
  @IsOptional()
  status?: ItemStatusEnum

  @IsString()
  @IsOptional()
  description?: string

}