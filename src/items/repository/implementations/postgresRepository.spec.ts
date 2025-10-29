/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, UpdateResult, DeleteResult } from 'typeorm';
import { Item } from '../../entities/item.entity';
import { CreateItemDto } from '../../dto/create-item.dto';
import { UpdateItemDto } from '../../dto/update-item.dto';
import { FindAllParams, ItemsRepositoryImpl } from './postgresRepository';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

const createQueryBuilderMock = () => {
  const qb: Partial<SelectQueryBuilder<Item>> = {
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };
  return qb as unknown as SelectQueryBuilder<Item>;
};

describe('ItemsRepositoryImpl ', () => {
  let repositoryImpl: ItemsRepositoryImpl;
  let ormRepo: MockType<Repository<Item>>;
  let qb: SelectQueryBuilder<Item>;

  beforeEach(async () => {
    qb = createQueryBuilderMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsRepositoryImpl,
        {
          provide: getRepositoryToken(Item),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(qb),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repositoryImpl = module.get<ItemsRepositoryImpl>(ItemsRepositoryImpl);
    ormRepo = module.get(getRepositoryToken(Item));
    jest.spyOn(console, 'log').mockImplementation(() => {}); 
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create and save item', async () => {
      const dto: CreateItemDto = { name: 'Task A', description: 'desc' };
      const created: Item = { id: 'uuid-1', name: dto.name, description: dto.description };
      (ormRepo.create as jest.Mock).mockReturnValue(created);
      (ormRepo.save as jest.Mock).mockResolvedValue(created);

      const result = await repositoryImpl.create(dto);

      expect(ormRepo.create).toHaveBeenCalledWith(dto);
      expect(ormRepo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('should propagate error', async () => {
      const dto: CreateItemDto = { name: 'Task A' };
      const created: Item = { name: dto.name } as Item;
      (ormRepo.create as jest.Mock).mockReturnValue(created);
      const error = new Error('db error');
      (ormRepo.save as jest.Mock).mockRejectedValue(error);

      await expect(repositoryImpl.create(dto)).rejects.toThrow(error);
      expect(ormRepo.create).toHaveBeenCalledWith(dto);
      expect(ormRepo.save).toHaveBeenCalledWith(created);
    });
  });

  describe('update', () => {
    it('should update and return the updated Item', async () => {
      const id = 'uuid-1';
      const dto: UpdateItemDto = { description: 'newDescription' };
      const updateResult: UpdateResult = { raw: {}, affected: 1, generatedMaps: [] };
      const updated: Item = { id, name: 'X', description: 'newDescription' } as Item;

      (ormRepo.update as jest.Mock).mockResolvedValue(updateResult);
      (ormRepo.findOneBy as jest.Mock).mockResolvedValue(updated);

      const result = await repositoryImpl.update(dto, id);

      expect(ormRepo.update).toHaveBeenCalledWith(id, dto);
      expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id });
      expect(result).toEqual(updated);
    });

    it('should propagate error', async () => {
      const id = 'uuid-1';
      const dto: UpdateItemDto = { description: 'newDescription' };
      const error = new Error('db-error');
      (ormRepo.update as jest.Mock).mockRejectedValue(error);

      await expect(repositoryImpl.update(dto, id)).rejects.toThrow(error);
      expect(ormRepo.update).toHaveBeenCalledWith(id, dto);
      expect(ormRepo.findOneBy).not.toHaveBeenCalled();
    });

    it('should return null when findById does not find after update', async () => {

      const id = 'uuid-2';
      const dto: UpdateItemDto = { description: 'newDescription' };
      const updateResult: UpdateResult = { raw: {}, affected: 0, generatedMaps: [] };
      (ormRepo.update as jest.Mock).mockResolvedValue(updateResult);
      (ormRepo.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await repositoryImpl.update(dto, id);

      expect(ormRepo.update).toHaveBeenCalledWith(id, dto);
      expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id });
      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return query and metadata correctly when page=1', async () => {
      const params: FindAllParams = {
        limit: 10,
        page: 1,
        order: 'ASC',
        sort: 'createdAt',
      };
      const items: Item[] = [{ id: '1', name: 'A' } as Item, { id: '2', name: 'B' } as Item];
      (qb.getManyAndCount as jest.Mock).mockResolvedValue([items, 17]);

      const result = await repositoryImpl.getAll(params);

      expect(ormRepo.createQueryBuilder).toHaveBeenCalledWith('item');
      expect(qb.skip).toHaveBeenCalledWith((params.page - 1) * params.limit);
      expect(qb.take).toHaveBeenCalledWith(params.limit);
      expect(qb.where).not.toHaveBeenCalled();
      expect(qb.orderBy).toHaveBeenCalledWith(`item.${params.sort}`, params.order);
      expect(qb.getManyAndCount).toHaveBeenCalled();

      const totalPages = Math.ceil(17 / 10);
      expect(result.metadata).toEqual({
        page: 1,
        limit: 10,
        totalItems: 17,
        totalPages,
        nextPage: 2,
        previousPage: null, 
        sort: 'createdAt',
        order: 'ASC',
      });
    });

    it('should apply search only if exists', async () => {
      const params: FindAllParams = {
        limit: 5,
        page: 2,
        order: 'DESC',
        sort: 'name',
        search: 'foo',
      };
      (qb.getManyAndCount as jest.Mock).mockResolvedValue([[], 0]);

      const result = await repositoryImpl.getAll(params);

      expect(qb.where).toHaveBeenCalledWith('item.name ILIKE :search', { search: `%${params.search}%` });
      expect(result.data).toEqual([]);
      expect(result.metadata.totalItems).toBe(0);
      expect(result.metadata.totalPages).toBe(0);
      expect(result.metadata.nextPage).toBe(null);
      expect(result.metadata.previousPage).toBe(1); 
    });

    it('should propagate error', async () => {
      const params: FindAllParams = {
        limit: 5,
        page: 1,
        order: 'ASC',
        sort: 'updatedAt',
      };
      const error = new Error('query error');
      (qb.getManyAndCount as jest.Mock).mockRejectedValue(error);

      await expect(repositoryImpl.getAll(params)).rejects.toThrow(error);
    });
  });

  describe('getById', () => {
    it('should return Item when found', async () => {
      const id = 'uuid-1';
      const item: Item = { id, name: 'X' } as Item;
      (ormRepo.findOneBy as jest.Mock).mockResolvedValue(item);

      const result = await repositoryImpl.getById(id);

      expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id });
      expect(result).toEqual(item);
    });

    it('should return null for item not found', async () => {
      const id = 'uuid-2';
      (ormRepo.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await repositoryImpl.getById(id);

      expect(result).toBeNull();
    });

    it('should propagate error', async () => {
      const id = 'uuid-3';
      const error = new Error('find error');
      (ormRepo.findOneBy as jest.Mock).mockRejectedValue(error);

      await expect(repositoryImpl.getById(id)).rejects.toThrow(error);
    });
  });

  describe('deleteById', () => {
    it('should delete and return null', async () => {
      const id = 'uuid-1';
      const deleteResult: DeleteResult = { raw: {}, affected: 1 };
      (ormRepo.delete as jest.Mock).mockResolvedValue(deleteResult);

      const result = await repositoryImpl.deleteById(id);

      expect(ormRepo.delete).toHaveBeenCalledWith({ id });
      expect(result).toBeNull();
    });

    it('should propagate error', async () => {
      const id = 'uuid-2';
      const error = new Error('delete error');
      (ormRepo.delete as jest.Mock).mockRejectedValue(error);

      await expect(repositoryImpl.deleteById(id)).rejects.toThrow(error);
    });
  });
});