import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { USER_NOT_FOUND, WRONG_PASSWORD } from '../src/auth/auth.constants';

const loginDto: AuthDto = {
  login: 'vovan2@mail.ru',
  password: '1',
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST) - success', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(200)
      .then(({ body }: request.Response) => {
        token = body.access_token;
        expect(token).toBeDefined();
      });
  });

  it('/auth/login (POST) - fail', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...loginDto, password: '12' })
      .expect(401, {
        statusCode: 401,
        message: WRONG_PASSWORD,
        error: 'Unauthorized',
      });
  });

  it('/auth/login (POST) - fail', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...loginDto, login: 'vovan3@mail.ru' })
      .expect(401, {
        statusCode: 401,
        message: USER_NOT_FOUND,
        error: 'Unauthorized',
      });
  });

  afterAll(() => {
    disconnect();
  });
});
