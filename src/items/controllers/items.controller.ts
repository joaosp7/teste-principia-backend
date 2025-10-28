import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ItemsService } from '../services/items.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ParamItemGetRouteDto } from '../dto/param-item-get-route.dto';
import { validate } from 'class-validator';
import { ParamIdItemDto } from '../dto/param-id-item.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}
  //@UseGuards(ApiKeyGuard)
  @Post()
  async create(@Body() createItemDto: CreateItemDto) {
    return await this.itemsService.createNewItem(createItemDto);
  }
  //@UseGuards(ApiKeyGuard)
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string
  ) {

    const dto = new ParamItemGetRouteDto()
    dto.limit = limit ? Number(limit): undefined;
    dto.page = page ? Number(page): undefined;
    dto.search = search;
    dto.sort = sort as any as 'createdAt' | 'updatedAt' | 'name';
    dto.order = order as any as 'ASC' | 'DESC'

    const errors = await validate(dto);

    if(errors.length) {
      console.log('Validation for findAll parameters failed, ', errors);
      throw new BadRequestException()
    }

    return await this.itemsService.findAllItems(dto);
  }
  //@UseGuards(ApiKeyGuard)
  @Get(':id')
  async findOne(@Param('id') { id }: ParamIdItemDto) {
    return await this.itemsService.findOneItem(id);
  }
  //@UseGuards(ApiKeyGuard)
  @Patch(':id')
  async update(@Param('id') { id }: ParamIdItemDto, @Body() updateItemDto: UpdateItemDto) {
    return await this.itemsService.updateItem(id, updateItemDto );
  }
  //@UseGuards(ApiKeyGuard)
  @Delete(':id')
  async remove(@Param('id') { id }: ParamIdItemDto) {
    return await this.itemsService.removeItem(id);
  }
}
