export const endHelper = (num: number, words: string[]) => {
  if (num == 1) {
    return `${num} ${words[0]}`;
  } else if ([2, 3, 4].includes(num)) {
    return `${num} ${words[1]}`;
  } else {
    return `${num} ${words[2]}`;
  }
};
