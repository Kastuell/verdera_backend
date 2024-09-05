import { sceneButtons } from 'src/bot/buttons/scene.buttons';
import { Markup } from 'telegraf';

export function selectCourseChapterKeyboard(
  courseChapters: {
    completed: boolean;
    unlocked: boolean;
    name: string;
    lection: {
      id: number;
      name: string;
      slug: string;
    };
  }[],
) {
  const temp = courseChapters
    .filter((item) => item.unlocked)
    .map((i) => Markup.button.callback(i.name, `Лекция: ${i.lection.slug}`));
  return Markup.inlineKeyboard(
    temp.concat(
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
