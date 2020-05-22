// @flow
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import _ from 'lodash';
import populateEvents from './Packer';

const LEFT_MARGIN = 60 - 1;
// const RIGHT_MARGIN = 10
const CALENDER_HEIGHT = 2400;
// const EVENT_TITLE_HEIGHT = 15
const TEXT_LINE_HEIGHT = 17;
// const MIN_EVENT_TITLE_WIDTH = 20
// const EVENT_PADDING_LEFT = 4

function range(from, to) {
  return Array.from(Array(to), (_, i) => from + i);
}


const DayView = ({
  date,
  end,
  events,
  format24h,
  index,
  onEventTapped,
  renderEvent,
  start,
  styles,
  width,
}) => {
  const calendarHeight = (end - start) * 100;
  const containerWidth = width - LEFT_MARGIN;
  const packedEvents = populateEvents(events, width, start);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    wait(2000).then(() => setRefreshing(false));
  }, [refreshing]);

  const renderRedLine = () => {
    const now = moment();
    if (!now.isSame(date, 'day')) return null;
    const offset = 100;
    const timeNowHour = now.hour();
    const timeNowMin = now.minutes();
    return (
      <View
        key="timeNow"
        style={[
          styles.lineNow,
          {
            top:
              offset * (timeNowHour - start)
              + (offset * timeNowMin) / 60,
            width: width - 20,
          },
        ]}
      />
    );
  };

  const renderLines = () => {
    const offset = calendarHeight / (end - start);
    const time = moment().startOf('date');


    return [...Array(24).keys()].map((i) => {
      const timeText = format24h ? time.format('HH:mm') : time.format('HH:mm A');
      time.add(1, 'hour').format();
      return (
        <>
          <Text style={[styles.timeLabel, { top: offset * i - 6 }]}>
            {timeText}
          </Text>
          <View style={[styles.line, { top: offset * i, width: width - 20 }]} />
        </>
      );
    });

  };

  const eventTappedHandler = (event) => { onEventTapped(event); };

  const renderEvents = () => {
    const componentEvents = packedEvents.map((event, i) => {
      const style = {
        left: event.left,
        height: event.height,
        width: event.width,
        top: event.top,
      };

      const eventColor = {
        backgroundColor: event.color,
      };

      // Fixing the number of lines for the event title makes this calculation easier.
      // However it would make sense to overflow the title to a new line if needed
      const numberOfLines = Math.floor(event.height / TEXT_LINE_HEIGHT);
      const formatTime = format24h ? 'HH:mm' : 'hh:mm A';
      return (
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => eventTappedHandler(event)}
          key={event.id}
          style={[styles.event, style, event.color && eventColor]}
        >
          { renderEvent(event) || (
            <View>
              <Text numberOfLines={1} style={styles.eventTitle}>
                {event.title || 'Event'}
              </Text>
              {numberOfLines > 1 ? (
                <Text
                  numberOfLines={numberOfLines - 1}
                  style={[styles.eventSummary]}
                >
                  {event.summary || ' '}
                </Text>
              ) : null}
              {numberOfLines > 2 ? (
                <Text style={styles.eventTimes} numberOfLines={1}>
                  {moment(event.start).format(formatTime)} - {' '}
                  {moment(event.end).format(formatTime)}
                </Text>
              ) : null}
            </View>
          )}
        </TouchableOpacity>
      );
    });

    return (
      <View>
        <View style={{ marginLeft: LEFT_MARGIN }}>{componentEvents}</View>
      </View>
    );
  };

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={[styles.contentStyle, { width }]}
    >
      {renderLines()}
      {renderEvents()}
      {renderRedLine()}
    </ScrollView>
  );
};

const MemoizedDayView = React.memo(DayView, (prevProps, nextProps) => (
  JSON.stringify(prevProps.events) === JSON.stringify(nextProps.events)
));

export default MemoizedDayView;
