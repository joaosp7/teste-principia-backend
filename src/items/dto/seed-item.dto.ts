import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsPositive, Max, Min } from "class-validator";

export class SeedItemDto {
  
@ApiProperty({
  type: 'integer',
  minimum: 1,
  maximum: 15,
  default: 5,
  nullable: true,
  description: 'Number of items to be generated into the database'
})  
@IsNumber()
@Min(1)
@Max(15)
@IsOptional()
  seeds?: number
}