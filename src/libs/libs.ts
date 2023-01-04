import { shuffle } from 'lodash-es';

export const drawing = (list: string[], count: number) => {
  const temp = [...list].filter((n) => n.trim());
  const newShuffleList = shuffle(temp);
  return newShuffleList.splice(0, count);
};
