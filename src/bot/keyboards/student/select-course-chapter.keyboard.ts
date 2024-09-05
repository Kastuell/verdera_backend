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
  return Markup.inlineKeyboard(
    courseChapters
      .map((item) => {
        if (item.unlocked) {
          return Markup.button.callback(
            item.name,
            `Лекция: ${item.lection.slug}`,
          );
        }
      })
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
