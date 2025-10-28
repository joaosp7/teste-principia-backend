import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller'; 
import { ItemsService } from '../services/items.service'; 
import { BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { Item } from '../entities/item.entity';

describe('ItemsController', () => {
  let controller: ItemsController;

  const serviceMock = {
    createNewItem: jest.fn(),
    findAllItems: jest.fn(),
    findOneItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    jest.spyOn(console, 'log').mockImplementation(() => {}); 
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('create (POST /items)', () => {
    it('should delegate to createNewItem and return result', async () => {
      const dto: CreateItemDto = { name: 'Task A', description: 'desc' };
      const created: Item = { id: 'uuid-1', name: dto.name, description: dto.description } as Item;
      serviceMock.createNewItem.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(serviceMock.createNewItem).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('should propagate service error', async () => {
      const dto: CreateItemDto = { name: 'Task A' };
      const error = new Error('create error');
      serviceMock.createNewItem.mockRejectedValue(error);

      await expect(controller.create(dto)).rejects.toThrow(error);
    });
  });

  describe('findAll (GET /items) with class-validator', () => {
    it('it should validate dto and make service call', async () => {
      
      const page = '2';
      const limit = '5';
      const search = 'foo';
      const sort = 'name';
      const order = 'ASC';

      const serviceResult = {
        data: [],
        metadata: {
          page: 2,
          limit: 5,
          totalItems: 0,
          totalPages: 0,
          nextPage: null,
          previousPage: 1,
          sort: 'name',
          order: 'ASC',
        },
      };
      serviceMock.findAllItems.mockResolvedValue(serviceResult);

      const result = await controller.findAll(page, limit, search, sort, order);

      expect(serviceMock.findAllItems).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        search: 'foo',
        sort: 'name',
        order: 'ASC',
      });
      expect(result).toEqual(serviceResult);
    });

    it('should throw BadRequest when validation fails', async () => {
      
      const page = 'abc';
      const limit = 'xyz';
      const search = 'foo';
      const sort = 'name';
      const order = 'ASC';

      await expect(controller.findAll(page, limit, search, sort, order)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(serviceMock.findAllItems).not.toHaveBeenCalled();
    });

    it('it should apply Number() transformation properly, handling edge cases', async () => {
      
      serviceMock.findAllItems.mockResolvedValue({
        data: [],
        metadata: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
          nextPage: null,
          previousPage: null,
          sort: 'createdAt',
          order: 'DESC',
        },
      });

      
      const result = await controller.findAll(undefined, undefined, undefined, undefined, undefined);

      expect(serviceMock.findAllItems).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findOne (GET /items/:id)', () => {
    it('should return item when found', async () => {
      const param = { id: 'uuid-1' } as any; 
      const item: Item = { id: param.id, name: 'X' } as Item;
      serviceMock.findOneItem.mockResolvedValue(item);

      const result = await controller.findOne(param);

      expect(serviceMock.findOneItem).toHaveBeenCalledWith(param.id);
      expect(result).toEqual(item);
    });

    it('should return null for not found item', async () => {
      const param = { id: 'uuid-2' } as any;
      serviceMock.findOneItem.mockResolvedValue(null);

      const result = await controller.findOne(param);

      expect(result).toBeNull();
    });

    it('should propagate service error', async () => {
      const param = { id: 'uuid-3' } as any;
      const error = new Error('find error');
      serviceMock.findOneItem.mockRejectedValue(error);

      await expect(controller.findOne(param)).rejects.toThrow(error);
    });
  });

  describe('update (PATCH /items/:id)', () => {
    it('should update and return item', async () => {
      const param = { id: 'uuid-1' } as any;
      const dto: UpdateItemDto = { description: 'newDescription' };
      const updated: Item = { id: param.id, name: 'X', description: 'newDescription' } as Item;

      serviceMock.updateItem.mockResolvedValue(updated);

      const result = await controller.update(param, dto);

      expect(serviceMock.updateItem).toHaveBeenCalledWith(param.id, dto);
      expect(result).toEqual(updated);
    });

    it('should return null when item does not exist', async () => {
      const param = { id: 'uuid-2' } as any;
      const dto: UpdateItemDto = { description: 'newDescription' };

      serviceMock.updateItem.mockResolvedValue(null);

      const result = await controller.update(param, dto);

      expect(result).toBeNull();
    });

    it('should propagate service error', async () => {
      const param = { id: 'uuid-3' } as any;
      const dto: UpdateItemDto = { description: 'nova' };
      const error = new Error('update error');

      serviceMock.updateItem.mockRejectedValue(error);

      await expect(controller.update(param, dto)).rejects.toThrow(error);
    });
  });

  describe('remove (DELETE /items/:id)', () => {
    it('should remove existing item', async () => {
      const param = { id: 'uuid-1' } as any;
      serviceMock.removeItem.mockResolvedValue(undefined);

      const result = await controller.remove(param);

      expect(serviceMock.removeItem).toHaveBeenCalledWith(param.id);
      expect(result).toBeUndefined();
    });

    it('should return null when item does not exists', async () => {
      const param = { id: 'uuid-2' } as any;
      serviceMock.removeItem.mockResolvedValue(null);

      const result = await controller.remove(param);

      expect(serviceMock.removeItem).toHaveBeenCalledWith(param.id);
      expect(result).toBeNull();
    });

    it('should propagate service error', async () => {
      const param = { id: 'uuid-3' } as any;
      const error = new Error('delete error');
      serviceMock.removeItem.mockRejectedValue(error);

      await expect(controller.remove(param)).rejects.toThrow(error);
    });
  });
});