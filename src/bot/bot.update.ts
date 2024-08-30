import { InjectBot, Start, Update } from 'nestjs-telegraf';
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
  }

  async notificate(userTgId: number[], message: string) {
    userTgId.map(
      async (item) => await this.bot.telegram.sendMessage(item, message),
    );
  }
}

