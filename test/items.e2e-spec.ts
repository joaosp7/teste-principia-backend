import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';

jest.mock('../src/env/env', () => ({
  env: {
    APP_SECRET: 'abacaxi',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: 5432,
    POSTGRES_DB: 'test',
    POSTGRES_USER: 'postgres',
    POSTGRES_PASSWORD: 'test',
    PORT: 3000,
    ENVIRONMENT: 'dev',
  },
}));

import { ItemsController } from '../src/items/controllers/items.controller';
import { ItemsService } from '../src/items/services/items.service';
import { SeedService } from '../src/items/services/seed.service';

describe('ItemsController (e2e)', () => {
  let app: INestApplication;

  const serviceMock = {
    createNewItem: jest.fn(),
    findAllItems: jest.fn(),
    findOneItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
  };

  const seedServiceMock = {
    insert: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: serviceMock,
        },
        {
          provide: SeedService,
          useValue: seedServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe(),
    );

    jest.spyOn(console, 'log').mockImplementation(() => {});
    await app.init();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /items', () => {
    it('should create item and return 201 status code', async () => {
      const dto = { name: 'Task A', description: 'desc' };
      const created = { id: 'uuid-1', ...dto };
      serviceMock.createNewItem.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post('/items')
        .set('authorization', 'abacaxi')
        .send(dto);

      expect(serviceMock.createNewItem).toHaveBeenCalledWith(dto);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ data: [created] });
    });

    it('should return Internal Server Error when service throws exeption', async () => {
      const dto = { name: 'Task A' };
      serviceMock.createNewItem.mockRejectedValue(new Error('create error'));

      const res = await request(app.getHttpServer())
        .post('/items')
        .set('authorization', 'abacaxi')
        .send(dto);

      expect(res.status).toBe(500);
    });
  });

  describe('GET /items', () => {
    it('should return items with 200 status code', async () => {
      const paginated = {
        data: [{ id: '1', name: 'A' }],
        metadata: {
          page: 2,
          limit: 5,
          totalItems: 1,
          totalPages: 1,
          nextPage: null,
          previousPage: 1,
          sort: 'name',
          order: 'ASC',
        },
      };
      serviceMock.findAllItems.mockResolvedValue(paginated);

      const res = await request(app.getHttpServer())
        .get('/items')
        .set('authorization', 'abacaxi')
        .query({ page: '2', limit: '5', search: 'foo', sort: 'name', order: 'ASC' });

      expect(serviceMock.findAllItems).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        search: 'foo',
        sort: 'name',
        order: 'ASC',
      });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(paginated);
    });

    it('should return 400 bad request when page/limit invalid', async () => {
      const res = await request(app.getHttpServer())
        .get('/items')
        .set('authorization', 'abacaxi')
        .query({ page: 'abc', limit: 'xyz', sort: 'name', order: 'ASC' });

      expect(res.status).toBe(400);
      expect(serviceMock.findAllItems).not.toHaveBeenCalled();
    });

    it('should allow empty params and the default case should be applied', async () => {
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
      serviceMock.findAllItems.mockResolvedValue(paginated);

      const res = await request(app.getHttpServer())
        .get('/items')
        .set('authorization', 'abacaxi');

      expect(serviceMock.findAllItems).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toEqual(paginated);
    });
  });

  describe('GET /items/:id', () => {
    it('should return Item with status code 200', async () => {
      const item = { id: 'uuid-1', name: 'A' };
      serviceMock.findOneItem.mockResolvedValue(item);

      const res = await request(app.getHttpServer())
        .get('/items/uuid-1')
        .set('authorization', 'abacaxi');

      expect(serviceMock.findOneItem).toHaveBeenCalledWith('uuid-1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: [item] });
    });

    it('should return status code 404 when item does not exist', async () => {
      serviceMock.findOneItem.mockRejectedValue(new NotFoundException());

      const res = await request(app.getHttpServer())
        .get('/items/uuid-404')
        .set('authorization', 'abacaxi');

      expect(res.status).toBe(404);
    });

    it('should return Internal Server Error 500 when exception are thrown', async () => {
      serviceMock.findOneItem.mockRejectedValue(new Error('find error'));

      const res = await request(app.getHttpServer())
        .get('/items/uuid-err')
        .set('authorization', 'abacaxi');

      expect(res.status).toBe(500);
    });
  });

  describe('PATCH /items/:id', () => {
    it('should update and return updated item with status 200', async () => {
      const dto = { description: 'new' };
      const updated = { id: 'uuid-1', name: 'A', description: 'new' };
      serviceMock.updateItem.mockResolvedValue(updated);

      const res = await request(app.getHttpServer())
        .patch('/items/uuid-1')
        .set('authorization', 'abacaxi')
        .send(dto);

      expect(serviceMock.updateItem).toHaveBeenCalledWith('uuid-1', dto);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: [updated] });
    });

    it('should return 404 when items does not exist', async () => {
      serviceMock.updateItem.mockRejectedValue(new NotFoundException());

      const res = await request(app.getHttpServer())
        .patch('/items/uuid-404')
        .set('authorization', 'abacaxi')
        .send({ description: 'new' });

      expect(res.status).toBe(404);
    });

    it('should return 500 if service fails', async () => {
      serviceMock.updateItem.mockRejectedValue(new Error('update error'));

      const res = await request(app.getHttpServer())
        .patch('/items/uuid-err')
        .set('authorization', 'abacaxi')
        .send({ description: 'new' });

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /items/:id', () => {
    it('should return 204 in best cenario', async () => {
      serviceMock.removeItem.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .delete('/items/uuid-1')
        .set('authorization', 'abacaxi');

      expect(serviceMock.removeItem).toHaveBeenCalledWith('uuid-1');
      expect(res.status).toBe(204);
    });

    it('should return 404 when item does not exist', async () => {
      serviceMock.removeItem.mockRejectedValue(new NotFoundException());

      const res = await request(app.getHttpServer())
        .delete('/items/uuid-404')
        .set('authorization', 'abacaxi');

      expect(res.status).toBe(404);
    });

    it('should return 500 if service fails', async () => {
      serviceMock.removeItem.mockRejectedValue(new Error('delete error'));

      const res = await request(app.getHttpServer())
        .delete('/items/uuid-err')
        .set('authorization', 'abacaxi');

      expect(res.status).toBe(500);
    });
  });
});