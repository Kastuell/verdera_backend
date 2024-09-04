import { Ctx, Hears, InjectBot, Update } from 'nestjs-telegraf';
import { UserService } from 'src/user/user.service';
import { Telegraf } from 'telegraf';
import { BotContext } from '../bot.context';
import { studentButtons } from '../buttons/student.buttons';
import { GET_LECTIONS } from '../scenes/scenes.constants';

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
        await ctx.scene.enter(GET_LECTIONS)
      }
    }
  }

}
