import { Action, Ctx, Hears, InjectBot, Update } from 'nestjs-telegraf';
import { UserService } from 'src/user/user.service';
import { Telegraf } from 'telegraf';
import { BotContext } from '../bot.context';
import { studentButtons } from '../buttons/student.buttons';
import { GET_LECTIONS } from '../constants/scenes.constants';
import { NOT_STUDENT, OUT_IN_DB } from '../constants/main.constants';
import { WizardContext } from 'telegraf/typings/scenes';

@Update()
export class BotStudentUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private userService: UserService,
  ) {}

  @Action(studentButtons.lections.callback)
  async lections(@Ctx() ctx: BotContext) {
      // @ts-ignore
    console.log(ctx.update.callback_query)
    const user = await this.userService.getByChatId(
      // @ts-ignore
      ctx.update.callback_query.from.id,
    );

    if (!user) {
      await ctx.reply(OUT_IN_DB);
    } else {
      if (user.role !== 'STUDENT' && user.role !== 'ADMIN') {
        await ctx.reply(NOT_STUDENT);
      } else {
        await ctx.scene.enter(GET_LECTIONS);
      }
    }
  }
}
