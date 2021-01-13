import { BLOCK_HEIGHT, MINUTES_PER_BLOCK } from "./constants";

export const newDate = (dateString) => new Date(`${dateString}T00:00:00`);

export const addZero = (number) => number >= 10 ? number : `0${number}`;

export const format24 = (date) => `${addZero(date.getHours())}:${addZero(date.getMinutes())}`;

export const nowTop = (start) => {
  const now = new Date()
  const nowInMinutes = now.getHours() * 60 + now.getMinutes();
  const startInMinutes = start * 60;
  return ((nowInMinutes - startInMinutes) / MINUTES_PER_BLOCK) * BLOCK_HEIGHT;
};