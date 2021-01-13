import { times } from "lodash";

export const newDate = (dateString) => new Date(`${dateString}T00:00:00`);

export const addZero = (number) => number >= 10 ? number : `0${number}`;

export const format24 = (date) => `${addZero(date.getHours())}:${addZero(date.getMinutes())}`;