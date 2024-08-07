import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { CourseModule } from './course/course.module';
import { CourseChapterModule } from './course_chapter/course_chapter.module';
import { OrderModule } from './order/order.module';
import { CourseTestModule } from './course_test/course_test.module';
import { QuestionModule } from './question/question.module';
import { AnswerModule } from './answer/answer.module';
import { LectionModule } from './lection/lection.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, ProductModule, CategoryModule, CourseModule, CourseChapterModule, OrderModule, CourseTestModule, QuestionModule, AnswerModule, LectionModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
