import { Markup } from 'telegraf';

export function actionFunction() {
  return Markup.keyboard(
    [Markup.button.callback('Текущие даты занятий', 'cur_job_dates')],
    {
      columns: 3,
    },
  );
}
