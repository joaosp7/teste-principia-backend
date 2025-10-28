import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service'; // ajuste o path
import { ItemsRepositoryImpl } from '../repository/implementations/postgresRepository'; // ajuste o path
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { Item } from '../entities/item.entity';
import { ParamItemGetRouteDto } from '../dto/param-item-get-route.dto';

describe('ItemsService', () => {
  let service: ItemsService;

  const repoMock = {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: ItemsRepositoryImpl,
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    jest.spyOn(console, 'log').mockImplementation(() => {}); 
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('createNewItem', () => {
    it('should create new Item calling the repository', async () => {
      const dto: CreateItemDto = { name: 'Task A', description: 'desc' };
      const created: Item = { id: 'uuid-1', name: dto.name, description: dto.description } as Item;
      repoMock.create.mockResolvedValue(created);

      const result = await service.createNewItem(dto);

      expect(repoMock.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('should propagate repository error', async () => {
      const dto: CreateItemDto = { name: 'Task A' };
      const error = new Error('db error');
      repoMock.create.mockRejectedValue(error);

      await expect(service.createNewItem(dto)).rejects.toThrow(error);
    });
  });

  describe('findAllItems', () => {
    it('should call repository with correct params', async () => {
      const input: ParamItemGetRouteDto = {
        limit: 5,
        page: 2,
        search: 'foo',
        order: 'ASC',
        sort: 'name',
      } as any;

      const paginated = {
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
      repoMock.getAll.mockResolvedValue(paginated);

      const result = await service.findAllItems(input);

      expect(repoMock.getAll).toHaveBeenCalledWith({
        limit: 5,
        page: 2,
        search: 'foo',
        order: 'ASC',
        sort: 'name',
      });
      expect(result).toEqual(paginated);
    });

    it('should apply default in paremeter absence', async () => {
      const input = {} as any;
      const paginated = {
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
      };
      repoMock.getAll.mockResolvedValue(paginated);

      const result = await service.findAllItems(input);

      expect(repoMock.getAll).toHaveBeenCalledWith({
        limit: 10,
        page: 1,
        search: undefined,
        order: 'DESC',
        sort: 'createdAt',
      });
      expect(result).toEqual(paginated);
    });

    it('should propagate repository error', async () => {
      const input = { page: 1, limit: 10 } as any;
      const error = new Error('query error');
      repoMock.getAll.mockRejectedValue(error);

      await expect(service.findAllItems(input)).rejects.toThrow(error);
    });
  });

  describe('findOneItem', () => {
    it('should return Item when found', async () => {
      const id = 'uuid-1';
      const item: Item = { id, name: 'X' } as Item;
      repoMock.getById.mockResolvedValue(item);

      const result = await service.findOneItem(id);

      expect(repoMock.getById).toHaveBeenCalledWith(id);
      expect(result).toEqual(item);
    });

    it('should return null for Item not found', async () => {
      const id = 'uuid-2';
      repoMock.getById.mockResolvedValue(null);

      const result = await service.findOneItem(id);

      expect(repoMock.getById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });

    it('should propagate repository error', async () => {
      const id = 'uuid-3';
      const error = new Error('find error');
      repoMock.getById.mockRejectedValue(error);

      await expect(service.findOneItem(id)).rejects.toThrow(error);
    });
  });

  describe('updateItem', () => {
    it('should return null when item does not exist', async () => {
      const id = 'uuid-1';
      const dto: UpdateItemDto = { description: 'new description' };
      repoMock.getById.mockResolvedValue(null);

      const result = await service.updateItem(id, dto);

      expect(repoMock.getById).toHaveBeenCalledWith(id);
      expect(repoMock.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should correctly update and return the item', async () => {
      const id = 'uuid-2';
      const dto: UpdateItemDto = { description: 'new desc' };
      const existing: Item = { id, name: 'X' } as Item;
      const updated: Item = { id, name: 'X', description: 'new desc' } as Item;

      repoMock.getById.mockResolvedValue(existing);
      repoMock.update.mockResolvedValue(updated);

      const result = await service.updateItem(id, dto);

      expect(repoMock.getById).toHaveBeenCalledWith(id);
      expect(repoMock.update).toHaveBeenCalledWith(dto, id);
      expect(result).toEqual(updated);
    });

    it('should propagate error if query fails', async () => {
      const id = 'uuid-3';
      const dto: UpdateItemDto = { description: 'nova' };
      const existing: Item = { id, name: 'X' } as Item;
      const error = new Error('update failed');

      repoMock.getById.mockResolvedValue(existing);
      repoMock.update.mockRejectedValue(error);

      await expect(service.updateItem(id, dto)).rejects.toThrow(error);
      expect(repoMock.getById).toHaveBeenCalledWith(id);
      expect(repoMock.update).toHaveBeenCalledWith(dto, id);
    });

    it('should return null when repository returns null', async () => {
      const id = 'uuid-4';
      const dto: UpdateItemDto = { description: 'nova' };
      const existing: Item = { id, name: 'X' } as Item;

      repoMock.getById.mockResolvedValue(existing);
      repoMock.update.mockResolvedValue(null);

      const result = await service.updateItem(id, dto);

      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should return null and not call delete when item does not exist', async () => {
      const id = 'uuid-1';
      repoMock.getById.mockResolvedValue(null);

      const result = await service.removeItem(id);

      expect(repoMock.getById).toHaveBeenCalledWith(id);
      expect(repoMock.deleteById).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should correctly delete item', async () => {
      const id = 'uuid-2';
      const existing: Item = { id, name: 'Y' } as Item;

      repoMock.getById.mockResolvedValue(existing);
      repoMock.deleteById.mockResolvedValue(null);

      const result = await service.removeItem(id);

      expect(repoMock.getById).toHaveBeenCalledWith(id);
      expect(repoMock.deleteById).toHaveBeenCalledWith(id);
      expect(result).toBeUndefined(); 
    });

    it('should propagate error when query fails', async () => {
      const id = 'uuid-3';
      const existing: Item = { id, name: 'Y' } as Item;
      const error = new Error('delete error');

      repoMock.getById.mockResolvedValue(existing);
      repoMock.deleteById.mockRejectedValue(error);

      await expect(service.removeItem(id)).rejects.toThrow(error);
      expect(repoMock.deleteById).toHaveBeenCalledWith(id);
    });
  });
});