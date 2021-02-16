import { BLOCK_HEIGHT, MINUTES_PER_BLOCK, DAY_IN_MILISECONDS } from "./constants";

export const newDate = (dateString) => new Date(`${dateString}T00:00:00`);

export const addZero = (number) => number >= 10 ? number : `0${number}`;

export const format24 = (date) => `${addZero(date.getHours())}:${addZero(date.getMinutes())}`;

export const dateToString = (date) => (
  `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}`
)

export const nowTop = (start) => {
  const now = new Date()
  const nowInMinutes = now.getHours() * 60 + now.getMinutes();
  const startInMinutes = start * 60;
  return ((nowInMinutes - startInMinutes) / MINUTES_PER_BLOCK) * BLOCK_HEIGHT;
};

export const indexByDate = (events, date) => {
  const firstDate = newDate(events[0].date)
  const indexDate = newDate(date)
  const index = (indexDate.getTime() - firstDate.getTime()) / DAY_IN_MILISECONDS
  if (index < 0 || index >= events.length) return -1;
  return index;
}

export const dateByIndex = (events, index) => events[index].date;