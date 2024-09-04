import { mainButtons } from 'src/bot/buttons/main.buttons';
import { Markup } from 'telegraf';

export function shareContactKeyboard() {
  return Markup.keyboard([
    [Markup.button.contactRequest(mainButtons.contact.label)],
  ]).oneTime();
}
