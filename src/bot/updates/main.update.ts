import { Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { UserService } from 'src/user/user.service';
import { Context, Telegraf } from 'telegraf';
import { shareContactKeyboard } from '../keyboards/main/share-contact.keyboard';
import { studentCommonKeyboard } from '../keyboards/student/student-common.keyboard';
import { BotContext } from '../bot.context';
import { GET_LECTIONS } from '../constants/scenes.constants';
import { ADDED_IN_DB, NOT_STUDENT, OUT_IN_DB, SHARE_CONTACT, WELCOME } from '../constants/main.constants';

@Update()
export class BotMainUpdate {
  constructor(
    @InjectBot() readonly bot: Telegraf<Context>,
    private userService: UserService,
  ) {}

  @Start()
  async startBot(@Ctx() ctx: BotContext) {
    this.bot.telegram.setMyCommands([
      { command: 'start', description: 'Запуск бота' },
    ]);

    await ctx.reply(SHARE_CONTACT, {
      reply_markup: shareContactKeyboard().reply_markup,
    });
    return;
  }

  @On('contact')
  async contact(ctx: Context) {
    // @ts-ignore
    let phone_number = ctx.message.contact.phone_number;

    if (phone_number[0] !== '+') phone_number = '+' + phone_number;
    const user = await this.userService.getByPhoneNumber(phone_number);

    if (!user) {
      await ctx.reply(OUT_IN_DB);
      return;
    } else {
      if (user.role == 'USER') {
        await ctx.reply(NOT_STUDENT);
        return;
      } else {
        if (user.tg_id) {
          switch (user.role) {
            case 'ADMIN':
              await ctx.reply(WELCOME(user.name), {
                reply_markup: studentCommonKeyboard().reply_markup,
              });
              return;
            case 'STUDENT':
              await ctx.reply(`${user.id}`);
              return;
            case 'TEACHER':
              await ctx.reply('TEACHER');
              return;
          }
        } else {
          await this.userService.addTgId(
            ctx.message.chat.id.toString(),
            user.id,
          );
          ctx.reply(ADDED_IN_DB);
        }
      }
    }
  }

  async notificate(userTgId: number[], message: string) {
    userTgId.map(
      async (item) => await this.bot.telegram.sendMessage(item, message),
    );
  }
}
// политика конфидент
// видос айфон
// FAQ форма DONE
// расписание адаптив DONE
// подробнее о товаре зелёные квадратики DONE
// стрелочка наверх
// убрать ватсап DONE
// заказы DONE
// шапка каталога DONE

// комплектация красивая комплектация

// 3 видео и тесты сертификат
