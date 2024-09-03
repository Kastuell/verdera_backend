import { Action, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { UserService } from 'src/user/user.service';
import { Context, Markup, Telegraf } from 'telegraf';

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() readonly bot: Telegraf<Context>,
    private userService: UserService,
  ) {}

  @Start()
  async startBot(ctx: Context) {
    await ctx.reply('Ку!');

    ctx.reply(
      'Поделитесь номером для работы бота',
      Markup.keyboard([
        Markup.button.contactRequest('📲 Поделиться номером', true),
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
    } else {
      if (user.role == 'USER') {
        await ctx.reply('У вас нет подходящей роли');
      } else {
        if (user.tg_id) {
          if (user.role == 'ADMIN') {
            // await ctx.reply(
            //   'Получить лекции?',
            //   Markup.keyboard([
            //     Markup.button.callback('Да', '/lections', true),
            //     Markup.button.callback('Нет', '1', true),
            //   ]),
            // );
            return ctx.reply(
              'Получить лекции?',
              Markup.keyboard([
                Markup.button.callback('Да', '/lections', true),
              ]),
            );
          }
        } else {
          await this.userService.addTgId(
            ctx.message.chat.id.toString(),
            user.id,
          );
          await ctx.reply('Ваш tg id успешно добавлен в базу данных!');
        }
      }
    }
  }

  @Action('lections')
  async lections(ctx: Context) {
    console.log('qwe');
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
        await ctx.reply(
          'К какой лекции вы хотите получить материалы?',
          Markup.keyboard(
            user.boughtCourses.map((item) =>
              Markup.button.callback(item.course.name, 'lection', true),
            ),
          ),
        );
      }
    }
  }

  // @Action('lection')
  // async lection(ctx: Context) {
  //   console.log(ctx);
  // }

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
