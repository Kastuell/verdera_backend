import { studentButtons } from 'src/bot/buttons/student.buttons';
import { Markup } from 'telegraf';

export function studentCommonKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        studentButtons.lections.label,
        studentButtons.lections.callback,
      ),
    ],
  ]);
}
