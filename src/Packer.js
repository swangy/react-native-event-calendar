// @flow
import moment from 'moment';

const offset = 100;
const blockHeight = 100;
const minutesPerBlock = 30;

const heightPerMinute = blockHeight / minutesPerBlock;

function buildEvent(column, left, width, dayStart, ) {
  const startTime = moment(column.start);
  const endTime = column.end
    ? moment(column.end)
    : startTime.clone().add(1, 'hour');
  const dayStartTime = startTime
    .clone()
    .hour(dayStart)
    .minute(0);
  const diffMinutes = startTime.diff(dayStartTime, 'minutes', true);

  column.top = diffMinutes * ( blockHeight / minutesPerBlock );
  column.height = endTime.diff(startTime, 'minutes', true) * heightPerMinute;
  column.width = width;
  column.left = left;
  return column;
}

function collision(a, b) {
  return moment(a.end).isAfter(b.start) && moment(a.start).isBefore(b.end);
}

function expand(ev, column, columns) {
  var colSpan = 1;

  for (var i = column + 1; i < columns.length; i++) {
    var col = columns[i];
    for (var j = 0; j < col.length; j++) {
      var ev1 = col[j];
      if (collision(ev, ev1)) {
        return colSpan;
      }
    }
    colSpan++;
  }

  return colSpan;
}

function pack(columns, width, calculatedEvents, dayStart) {
  var colLength = columns.length;

  for (var i = 0; i < colLength; i++) {
    var col = columns[i];
    for (var j = 0; j < col.length; j++) {
      var colSpan = expand(col[j], i, columns);
      var L = (i / colLength) * width;
      var W = (width * colSpan) / colLength - 10;

      calculatedEvents.push(buildEvent(col[j], L, W, dayStart));
    }
  }
}

function populateEvents(events, screenWidth, dayStart) {
  let lastEnd;
  let columns;
  let self = this;
  let calculatedEvents = [];

  columns = [];
  lastEnd = null;

  events.forEach(function(ev, index) {
    if (lastEnd !== null && ev.start >= lastEnd) {
      pack(columns, screenWidth, calculatedEvents, dayStart);
      columns = [];
      lastEnd = null;
    }

    var placed = false;
    for (var i = 0; i < columns.length; i++) {
      var col = columns[i];
      if (!collision(col[col.length - 1], ev)) {
        col.push(ev);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([ev]);
    }

    if (lastEnd === null || ev.end > lastEnd) {
      lastEnd = ev.end;
    }
  });

  if (columns.length > 0) {
    pack(columns, screenWidth, calculatedEvents, dayStart);
  }
  return calculatedEvents;
}

export default populateEvents;
