import { Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { UserService } from 'src/user/user.service';
import { Context, Telegraf } from 'telegraf';
import { BotContext } from '../bot.context';
import {
  NOT_STUDENT,
  OUT_IN_DB,
  SHARE_CONTACT,
  WELCOME
} from '../constants/main.constants';
import { shareContactKeyboard } from '../keyboards/main/share-contact.keyboard';
import { studentCommonKeyboard } from '../keyboards/student/student-common.keyboard';

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
        const new_user = await this.userService.addTgId(
          ctx.message.chat.id.toString(),
          user.id,
        );
        switch (new_user.role) {
          case 'ADMIN':
            await ctx.reply(WELCOME(new_user.name), {
              reply_markup: studentCommonKeyboard().reply_markup,
            });
            return;
          case 'STUDENT':
            await ctx.reply(WELCOME(new_user.name), {
              reply_markup: studentCommonKeyboard().reply_markup,
            });
            return;
          case 'TEACHER':
            await ctx.reply('TEACHER');
            return;
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
// политика конфидент DONE
// видос айфон DONE 
// FAQ форма DONE
// расписание адаптив DONE
// подробнее о товаре зелёные квадратики DONE
// стрелочка наверх DONE
// убрать ватсап DONE
// заказы DONE
// шапка каталога DONE

// комплектация красивая комплектация

// 3 видео и тесты сертификат
