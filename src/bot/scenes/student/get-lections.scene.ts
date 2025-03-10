import { createReadStream } from 'fs';
import {
  Action,
  Ctx,
  Hears,
  InjectBot,
  Wizard,
  WizardStep,
} from 'nestjs-telegraf';
import { join } from 'path';
import { WELCOME } from 'src/bot/constants/main.constants';
import { GET_LECTIONS } from 'src/bot/constants/scenes.constants';
import { selectCourseChapterKeyboard } from 'src/bot/keyboards/student/select-course-chapter.keyboard';
import { selectCourseKeyboard } from 'src/bot/keyboards/student/select-course.keyboard';
import { studentCommonKeyboard } from 'src/bot/keyboards/student/student-common.keyboard';
import { CourseChapterService } from 'src/course_chapter/course_chapter.service';
import { LectionService } from 'src/lection/lection.service';
import { LocalFileService } from 'src/local_file/local_file.service';
import { UserService } from 'src/user/user.service';
import { endHelper } from 'src/utils/endHelper';
import { Context, Input, Telegraf } from 'telegraf';
import { CallbackQuery, Update } from 'telegraf/typings/core/types/typegram';
import { WizardContext } from 'telegraf/typings/scenes';

@Wizard(GET_LECTIONS)
export class GetLectionScene {
  constructor(
    @InjectBot() readonly bot: Telegraf<Context>,
    private readonly userService: UserService,
    private readonly courseChapterService: CourseChapterService,
    private readonly lectionService: LectionService,
    private readonly localFileService: LocalFileService,
  ) {}

  @WizardStep(1)
  async onSceneEnter(@Ctx() ctx: WizardContext) {
    try {
      const user = await this.userService.getByChatId(ctx.from.id);
      if (user.boughtCourses.length == 0) {
        await ctx.reply('У вас нет курсов!');
        return;
      } else {
        await ctx.reply('К какому курсу вы хотите получить лекцию?', {
          reply_markup: selectCourseKeyboard(user.boughtCourses).reply_markup,
        });
        ctx.wizard.next();
        return;
      }
    } catch (e) {
      console.log(e);
    }
  }

  @Action(/Курс: /i)
  @WizardStep(2)
  async onSelectCourse(
    @Ctx() ctx: WizardContext,
    @Ctx()
    callBack: Context<Update.CallbackQueryUpdate<CallbackQuery.DataQuery>>,
  ) {
    try {
      const user = await this.userService.getByChatId(callBack.from.id);

      const courseChapters = await this.courseChapterService.getByCourseSlug(
        callBack.callbackQuery.data.slice(6),
        user.id,
      );

      if (courseChapters.length == 0) {
      } else {
        await ctx.reply('К какой главе вы хотите получить лекцию?', {
          reply_markup:
            selectCourseChapterKeyboard(courseChapters).reply_markup,
        });
        ctx.wizard.next();
        return;
      }
    } catch (e) {
      console.log(e);
    }
  }

  @Action(/Лекция: /i)
  @WizardStep(3)
  async onSelectChapter(
    @Ctx() ctx: WizardContext,
    @Ctx()
    callBack: Context<Update.CallbackQueryUpdate<CallbackQuery.DataQuery>>,
  ) {
    try {
      const user = await this.userService.getByChatId(callBack.from.id);
      const lection = await this.lectionService.getBySlug(
        callBack.callbackQuery.data.slice(8),
        user.id,
      );

      if (lection.materials.length !== 0) {
        await ctx.reply(
          `Процесс получения материалов к лекции может занять какое-то время. Ожидайте ${endHelper(lection.materials.length, ['материал', 'материала', 'материалов'])}`,
        );
        lection.materials.forEach((item) => {
          const stream = createReadStream(
            process.platform == 'win32'
              ? join(process.cwd(), item.path)
              : join(process.cwd(), item.path.split('\\').join('/')),
          );
          ctx.replyWithDocument(
            // Input.fromReadableStream(stream, `${lection.name}.docx`),
            Input.fromReadableStream(stream, item.filename),
          );
        });

        // ctx.replyWithDocument(
        //   Input.fromURLStream(
        //     `http://${process.env.DOMAIN}:${process.env.PORT}/api/local-file/lection/2`, "qe.docx"
        //   ),
        // );
      } else {
        await ctx.reply('К данной главе отсутствуют лекции');
      }
    } catch (e) {
      console.log(e);
    }
  }

  @Action('leave_scene')
  async LeaveScene(@Ctx() ctx: WizardContext) {
    await ctx.scene.leave();
    const user = await this.userService.getByChatId(ctx.from.id);
    await ctx.reply(WELCOME(user.name), {
      reply_markup: studentCommonKeyboard().reply_markup,
    });
    return;
  }

  @Hears('/start')
  async onSceneLeave(@Ctx() ctx: WizardContext) {
    await ctx.scene.leave();

    return;
  }
}
