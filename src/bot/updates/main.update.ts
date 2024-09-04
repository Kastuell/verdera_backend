import {
  Action,
  Command,
  Ctx,
  Hears,
  InjectBot,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { GetQueryData } from 'src/decorators/getQuery.decorator';
import { UserService } from 'src/user/user.service';
import { Context, Markup, Telegraf } from 'telegraf';
import { studentButtons } from '../buttons/student.buttons';
import { mainButtons } from '../buttons/main.buttons';
import { studentCommonKeyboard } from '../keyboards/student/student-common.keyboard';

@Update()
export class BotMainUpdate {
  constructor(
    @InjectBot() readonly bot: Telegraf<Context>,
    private userService: UserService,
  ) {}

  @Start()
  async startBot(ctx: Context) {
    this.bot.telegram.setMyCommands([
      { command: 'start', description: 'Запуск бота' },
    ]);

    await ctx.reply(
      'Добро пожаловать!\n\nПоделитесь номером для работы бота',
      Markup.keyboard([
        [Markup.button.contactRequest(mainButtons.contact.label)],
      ]),
    );
  }

  @On('contact')
  async contact(ctx: Context) {
    const user = await this.userService.getByPhoneNumber(
      // @ts-ignore
      ctx.message.contact.phone_number,
    );

    if (!user) {
      await ctx.reply(
        'Вас нет в базе данных Verdera, сначала зарегистрируйтесь на verdera.ru',
      );
      return;
    } else {
      if (user.role == 'USER') {
        await ctx.reply('Вы не являетесь студентом Verdera');
        return;
      } else {
        if (user.tg_id) {
          switch (user.role) {
            case 'ADMIN':
              await ctx.reply(
                `Добро пожаловать ${user.name}!\n\nЧто вы хотите?`,
                {
                  reply_markup: studentCommonKeyboard().reply_markup,
                },
              );
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
          ctx.reply('Ваш tg id успешно добавлен в базу данных!');
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
