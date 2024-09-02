import { InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { UserService } from 'src/user/user.service';
import { Context, Telegraf } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() readonly bot: Telegraf<Context>,
    private readonly botService: BotService,
    private userService: UserService,
  ) {}

  @Start()
  async startBot(ctx: Context) {
    await ctx.reply('Ку!');

    ctx.reply('Поделитесь номером для работы бота', {
      reply_markup: {
        keyboard: [[{ text: '📲 Поделиться номером', request_contact: true }]],
        one_time_keyboard: true,
      },
    });
  }

  @On('contact')
  async contact(ctx: Context) {
    const user = await this.userService.getByPhoneNumber(
      // @ts-ignore
      ctx.message.contact.phone_number,
    );

    if (user.tg_id) {
      await ctx.reply('Вы уже делились номером');
    }

    if (!user) await ctx.reply('Вас нет в базе данных Verdera');

    await this.userService.addTgId(ctx.message.chat.id.toString(), user.id);

    await ctx.reply('Ваш tg id успешно добавлен в базу данных!');
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
