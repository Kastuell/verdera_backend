import { sceneButtons } from 'src/bot/buttons/scene.buttons';
import { Markup } from 'telegraf';

export function selectCourseKeyboard(
  courses: { course: { id: number; name: string } }[],
) {
  console.log(courses);
  return Markup.inlineKeyboard(
    courses
      .map((item) => Markup.button.callback(item.course.name, item.course.name))
      .concat(
        Markup.button.callback(
          sceneButtons.scene.label,
          sceneButtons.scene.callback,
        ),
      ),
    {
      columns: 1,
    },
  );
}
