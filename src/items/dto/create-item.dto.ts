/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ItemStatusEnum } from "../enums/itemStatus.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";


export class CreateItemDto {

  @ApiProperty({
    type: 'string',
    nullable: false,
    example: 'Item name'
    
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({
    type: 'string',
    enum: ItemStatusEnum,
    default: ItemStatusEnum.todo
  })
  @IsEnum(ItemStatusEnum)
  @IsOptional()
  status?: ItemStatusEnum


  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    example: 'This is the items description'
  })
  @IsString()
  @IsOptional()
  description?: string

}