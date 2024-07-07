import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {


  const PORT = process.env.PORT || 7000;

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api')
  app.getHttpAdapter().getInstance().disable('x-powered-by')
  app.use(cookieParser());
  app.enableShutdownHooks()
  app.enableCors({
    origin: ['http://localhost:3000', "https://www.verdera.ru"],
    credentials: true,
    exposedHeaders: 'set-cookie',
  });

  const prismaService = app.get(PrismaService)

  await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
}
bootstrap();
