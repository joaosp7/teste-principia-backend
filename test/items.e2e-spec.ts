import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import * as request from 'supertest';
import { ItemsController } from '../src/items/controllers/items.controller'; 
import { ItemsService } from '../src/items/services/items.service'; 
describe('ItemsController (e2e)', () => {
  let app: INestApplication;

  const serviceMock = {
    createNewItem: jest.fn(),
    findAllItems: jest.fn(),
    findOneItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: serviceMock,
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
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /items', () => {
    it('should create item and return 201 status code', async () => {
      const dto = { name: 'Task A', description: 'desc' };
      const created = { id: 'uuid-1', ...dto };
      serviceMock.createNewItem.mockResolvedValue(created);

      const res = await request(app.getHttpServer()).post('/items').send(dto);

      expect(serviceMock.createNewItem).toHaveBeenCalledWith(dto);
      expect(res.status).toBe(201); 
      expect(res.body).toEqual(created);
    });

    it('should return Internal Server Error when service throws exeption', async () => {
      const dto = { name: 'Task A' };
      serviceMock.createNewItem.mockRejectedValue(new Error('create error'));

      const res = await request(app.getHttpServer()).post('/items').send(dto);

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

      const res = await request(app.getHttpServer()).get('/items');

      expect(serviceMock.findAllItems).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toEqual(paginated);
    });
  });

  describe('GET /items/:id', () => {
    it('should return Item with status code 200', async () => {
      const item = { id: 'uuid-1', name: 'A' };
      serviceMock.findOneItem.mockResolvedValue(item);

      const res = await request(app.getHttpServer()).get('/items/uuid-1');

      expect(serviceMock.findOneItem).toHaveBeenCalledWith('uuid-1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(item);
    });

    it('should return null with status code 200 when item does not exist', async () => {
      serviceMock.findOneItem.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get('/items/uuid-404');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(null);
    });

    it('should return Internal Server Error 500 when exception are thrown', async () => {
      serviceMock.findOneItem.mockRejectedValue(new Error('find error'));

      const res = await request(app.getHttpServer()).get('/items/uuid-err');

      expect(res.status).toBe(500);
    });
  });

  describe('PATCH /items/:id', () => {
    it('should update and return updated item with status 200(204)', async () => {
      const dto = { description: 'nova' };
      const updated = { id: 'uuid-1', name: 'A', description: 'nova' };
      serviceMock.updateItem.mockResolvedValue(updated);

      const res = await request(app.getHttpServer()).patch('/items/uuid-1').send(dto);

      expect(serviceMock.updateItem).toHaveBeenCalledWith('uuid-1', dto);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
    });

    it('deve retornar 200 e null quando item não existe', async () => {
      serviceMock.updateItem.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).patch('/items/uuid-404').send({ description: 'nova' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(null);
    });

    it('deve retornar 500 se service falhar', async () => {
      serviceMock.updateItem.mockRejectedValue(new Error('update error'));

      const res = await request(app.getHttpServer()).patch('/items/uuid-err').send({ description: 'nova' });

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /items/:id', () => {
    it('deve retornar 200 e undefined quando remove com sucesso', async () => {
      serviceMock.removeItem.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer()).delete('/items/uuid-1');

      expect(serviceMock.removeItem).toHaveBeenCalledWith('uuid-1');
      expect(res.status).toBe(200);
    });

    it('deve retornar 200 e null quando item não existe', async () => {
      serviceMock.removeItem.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).delete('/items/uuid-404');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(null);
    });

    it('deve retornar 500 se service falhar', async () => {
      serviceMock.removeItem.mockRejectedValue(new Error('delete error'));

      const res = await request(app.getHttpServer()).delete('/items/uuid-err');

      expect(res.status).toBe(500);
    });
  });
});