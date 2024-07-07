import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, ProductModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
