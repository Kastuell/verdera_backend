import { Ctx, Hears, InjectBot, Update } from 'nestjs-telegraf';
import { UserService } from 'src/user/user.service';
import { Context, Markup, Telegraf } from 'telegraf';
import { studentButtons } from '../buttons/student.buttons';
import { WizardScene } from 'telegraf/typings/scenes';
import { BotContext } from '../bot.context';

@Update()
export class BotStudentUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private userService: UserService,
  ) {}

  @Hears(studentButtons.lections.label)
  async lections(@Ctx() ctx: BotContext) {
    const user = await this.userService.getByChatId(
      // @ts-ignore
      ctx.message.from.id.toString(),
    );

    if (!user) {
      await ctx.reply(
        'Вас нет в базе данных Verdera, сначала зарегистрируйтесь на verdera.ru',
      );
    } else {
      if (user.role !== 'STUDENT' && user.role !== 'ADMIN') {
        await ctx.reply('Вы не являетесь студентом Verdera');
      } else {
        await ctx.scene.enter('get_lections')
      }
    }
  }

}
