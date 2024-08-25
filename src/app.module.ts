import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule as schedule } from '@nestjs/schedule';
import { AnswerModule } from './answer/answer.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { CourseModule } from './course/course.module';
import { CourseChapterModule } from './course_chapter/course_chapter.module';
import { CourseTestModule } from './course_test/course_test.module';
import { DiscountModule } from './discount/discount.module';
import { LectionModule } from './lection/lection.module';
import { LocalFileModule } from './local_file/local_file.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { QuestionModule } from './question/question.module';
import { ScheduleModule } from './schedule/schedule.module';
import { SupportModule } from './support/support.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        UPLOADED_FILES_DESTINATION: Joi.string().required(),
        // ...
      }),
    }),
    schedule.forRoot(),
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
    CourseModule,
    CourseChapterModule,
    OrderModule,
    CourseTestModule,
    QuestionModule,
    AnswerModule,
    LectionModule,
    DiscountModule,
    LocalFileModule,
    SupportModule,
    ScheduleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
