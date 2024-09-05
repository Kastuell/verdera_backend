import { sceneButtons } from 'src/bot/buttons/scene.buttons';
import { Markup } from 'telegraf';

export function selectCourseKeyboard(
  courses: { course: { id: number; name: string; slug: string } }[],
) {
  return Markup.inlineKeyboard(
    courses
      .map((item) =>
        Markup.button.callback(item.course.name, `Курс: ${item.course.slug}`),
      )
      .concat(
        Markup.button.callback(
          sceneButtons.leave.label,
          sceneButtons.leave.callback,
        ),
      ),
    {
      columns: 1,
    },
  );
}
