/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class ParamIdItemDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string
}