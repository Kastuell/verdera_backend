import { InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() readonly bot: Telegraf<Context>,
    private readonly botService: BotService,
  ) {}

  @Start()
  async startBot(ctx: Context) {
    await ctx.reply('Ку!');
    ctx.reply('Send me your number please', {
      reply_markup: {
        keyboard: [[{ text: '📲 Send phone number', request_contact: true }]],
      },
    });
  }

  @On('contact')
  async contact(ctx: Context) {
    console.log(ctx.message);
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
