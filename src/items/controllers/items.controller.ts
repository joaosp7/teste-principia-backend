import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, UseInterceptors, UseGuards, HttpCode, HttpStatus, UseFilters } from '@nestjs/common';
import { ItemsService } from '../services/items.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ParamItemGetRouteDto } from '../dto/param-item-get-route.dto';
import { validate } from 'class-validator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { ApiKeyGuard } from '../../guards/apiKey.guard';
import { SeedItemDto } from '../dto/seed-item.dto';
import { SeedService } from '../services/seed.service';
import { ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ExceptionGeneralFilter } from '../../filters/exception.filters';

@ApiTags('Items')
@ApiSecurity('api-key')
@UseFilters(ExceptionGeneralFilter)
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService,
    private readonly seedService: SeedService,
  ) {}
  @ApiOperation({summary: 'create a new item into the database'})
  @UseInterceptors(ResponseInterceptor)
  @UseGuards(ApiKeyGuard)
  @Post()
  @HttpCode(201)
  async create(@Body() createItemDto: CreateItemDto) {
    return await this.itemsService.createNewItem(createItemDto);
  }

  @ApiOperation({summary: 'find all Items that meet a specific requirement'})
  @ApiQuery({name: 'page', description: 'current page for pagination', default: 1, required: false})
  @ApiQuery({name: 'limit', description: 'number of items to return', default: 10, required: false})
  @ApiQuery({name: 'search', description: 'items name which will be used to search', default: null, required: false})
  @ApiQuery({name: 'sort', description: 'item property that will be used for sorting', default: 'createdAt', required: false,})
  @ApiQuery({name: 'order', description: 'order for items display', default: 'DESC', required: false})
  @UseGuards(ApiKeyGuard)
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
      throw new BadRequestException(errors);
    }

    return await this.itemsService.findAllItems(dto);
  }

  @ApiOperation({summary: 'find item given by its ID'})
  @ApiParam({name: 'id', required: true, example: '54651724-59db-4c22-a236-bd53ba23a06a', description: 'ID (UUID v4) returned upon Item creation'})
  @UseInterceptors(ResponseInterceptor)
  @UseGuards(ApiKeyGuard)
  @Get(':id')
  async findOne(@Param('id') id : string) {
    return await this.itemsService.findOneItem(id);
  }

  @ApiOperation({summary: 'update an existing Item given its ID'})
  @ApiParam({name: 'id', required: true, example: '54651724-59db-4c22-a236-bd53ba23a06a', description: 'ID (UUID v4) returned upon Item creation'})
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(ResponseInterceptor)
  @Patch(':id')
  async update(@Param('id')  id : string, @Body() updateItemDto: UpdateItemDto) {
    return await this.itemsService.updateItem(id, updateItemDto );
  }


  @ApiOperation({summary: 'delete an existing Item given its ID'})
  @ApiParam({name: 'id', required: true, example: '54651724-59db-4c22-a236-bd53ba23a06a', description: 'ID (UUID v4) returned upon Item creation'})
  @UseGuards(ApiKeyGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id : string) {
    return await this.itemsService.removeItem(id);
  }


  @ApiOperation({summary: 'perform a seed into the database'})
  @UseGuards(ApiKeyGuard)
  @Post('/seed')
  async seed(@Body() body: SeedItemDto) {
      const n = body?.seeds ? body.seeds : 5
      return await this.seedService.insert(n);
  }
}
