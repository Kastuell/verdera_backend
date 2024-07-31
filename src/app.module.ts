import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { CourseModule } from './course/course.module';
import { CourseChapterModule } from './course_chapter/course_chapter.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, ProductModule, CategoryModule, CourseModule, CourseChapterModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
