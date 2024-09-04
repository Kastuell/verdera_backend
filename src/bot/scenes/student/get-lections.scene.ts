import { Action, Ctx, Hears, InjectBot, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { selectCourseKeyboard } from 'src/bot/keyboards/student/select-course.keyboard';
import { GetQueryData } from 'src/decorators/getQuery.decorator';
import { UserService } from 'src/user/user.service';
import { Context, Telegraf } from 'telegraf';
import { WizardContext } from 'telegraf/typings/scenes';
import { GET_LECTIONS } from '../scenes.constants';

@Wizard(GET_LECTIONS)
export class GetLectionScene {
  constructor(
    @InjectBot() readonly bot: Telegraf<Context>,
    private readonly userService: UserService,
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

  @Action([])
  @WizardStep(2)
  async onSelectCourse(@Ctx() ctx: WizardContext){
    // console.log(type)
  }


  @Hears('/start')
  async onSceneLeave(@Ctx() ctx: WizardContext) {
    await ctx.scene.leave();
    return;
  }
}
