/* eslint-disable @typescript-eslint/no-unsafe-call */

import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";


// transform to object later, for better use on code

export class ParamItemGetRouteDto {

  @IsString()
  @IsOptional()
  search?: string

  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number

  @IsInt()
  @Max(25)
  @IsOptional()
  limit?: number

  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'name'])
  @IsOptional()
  sort?: 'createdAt' | 'updatedAt' | 'name'


  @IsString()
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order?: 'ASC' | 'DESC'
}