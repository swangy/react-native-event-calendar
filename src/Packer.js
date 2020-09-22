// @flow
import moment from 'moment';

const blockHeight = 100;
const minutesPerBlock = 30;

const heightPerMinute = blockHeight / minutesPerBlock;

function buildEvent(column, left, width, dayStart, startKey, endKey) {
  const startTime = moment(column[startKey]);
  const endTime = column[endKey]
    ? moment(column[endKey])
    : startTime.clone().add(1, 'hour');
  const dayStartTime = startTime
    .clone()
    .hour(dayStart)
    .minute(0);
  const diffMinutes = startTime.diff(dayStartTime, 'minutes', true);
  const positiveDiff = diffMinutes > 0;

  column.top = (positiveDiff ? diffMinutes : 0) * ( blockHeight / minutesPerBlock );
  column.height = (endTime.diff(startTime, 'minutes', true) + (positiveDiff ? 0 : diffMinutes)) * heightPerMinute
  column.width = width;
  column.left = left;

  return column;
}

function collision(a, b, startKey, endKey) {
  return a[endKey] > b[startKey] && a[startKey] < b[endKey];
}

function expand(ev, column, columns, startKey, endKey) {
  var colSpan = 1;

  for (var i = column + 1; i < columns.length; i++) {
    var col = columns[i];
    for (var j = 0; j < col.length; j++) {
      var ev1 = col[j];
      if (collision(ev, ev1, startKey, endKey)) {
        return colSpan;
      }
    }
    colSpan++;
  }

  return colSpan;
}

function pack(columns, width, calculatedEvents, dayStart, startKey, endKey) {
  var colLength = columns.length;

  for (var i = 0; i < colLength; i++) {
    var col = columns[i];
    for (var j = 0; j < col.length; j++) {
      var colSpan = expand(col[j], i, columns, startKey, endKey);
      var L = (i / colLength) * width;
      var W = (width * colSpan) / colLength - 10;

      calculatedEvents.push(buildEvent(col[j], L, W, dayStart, startKey, endKey));
    }
  }
}

function populateEvents(events, screenWidth, dayStart, startKey, endKey) {
  let lastEnd;
  let columns;
  let self = this;
  let calculatedEvents = [];

  events = events
    .map((ev, index) => ({ ...ev, index: index }))
    .sort(function(a, b) {
      if (a[startKey] < b[startKey]) return -1;
      if (a[startKey] > b[startKey]) return 1;
      if (a[endKey] < b[endKey]) return -1;
      if (a[endKey] > b[endKey]) return 1;
      return 0;
    });

  columns = [];
  lastEnd = null;

  events.forEach(function(ev, index) {
    if (lastEnd !== null && ev[startKey] >= lastEnd) {
      pack(columns, screenWidth, calculatedEvents, dayStart, startKey, endKey);
      columns = [];
      lastEnd = null;
    }

    var placed = false;
    for (var i = 0; i < columns.length; i++) {
      var col = columns[i];
      if (!collision(col[col.length - 1], ev, startKey, endKey)) {
        col.push(ev);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([ev]);
    }

    if (lastEnd === null || ev[endKey] > lastEnd) {
      lastEnd = ev[endKey];
    }
  });

  if (columns.length > 0) {
    pack(columns, screenWidth, calculatedEvents, dayStart, startKey, endKey);
  }
  return calculatedEvents;
}

export default populateEvents;
