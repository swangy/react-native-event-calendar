// @flow
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import React, { useEffect, useRef } from 'react';
import moment from 'moment';
import _ from 'lodash';
import populateEvents from './Packer';
import {MINUTES_PER_BLOCK, BLOCK_HEIGHT, HEIGHT_PER_MINUTE} from './constants';

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
  refreshControl
}) => {
  const containerWidth = width - LEFT_MARGIN;
  const blockedEvents = events.filter((e) => e.booking_type === 'blocked');
  const normalEvents = events.filter((e) => e.booking_type !== 'blocked');
  const packedEvents = populateEvents(normalEvents, containerWidth, start);
  const scrollViewRef = useRef(null);

  const contentOffset = () => {
    const nowHour = moment().hour();
    if ((nowHour < (start + 1)) || (nowHour > (end + 1))) return 0;
    return nowTop() - 100;
  };

  useEffect(() => {
    if (Platform.OS === 'ios') return;
    setTimeout(() => {
      if (!scrollViewRef.current) return;
      scrollViewRef.current.scrollTo({ y: contentOffset(), animated: false });
    }, 0);
  }, []);

  const nowTop = () => {
    const now = moment();
    const nowInMinutes = now.hour() * 60 + now.minutes();
    const startInMinutes = start * 60;
    return ((nowInMinutes - startInMinutes) / MINUTES_PER_BLOCK) * BLOCK_HEIGHT;
  };

  const renderRedLine = () => {
    const now = moment();
    if (!now.isSame(date, 'day')) return null;
    const top = nowTop();
    const lineWidth = width - 20;
    return (
      <>
        <View style={[styles.lineNow, { top, width: lineWidth }]} />
        <View style={[styles.circleNow, { top: top - 3 }]} />
      </>
    );
  };

  const renderLines = () => {
    const time = moment().hour(start).minute(0);
    const lines = (((end - start) * 60) / MINUTES_PER_BLOCK);

    return [...Array(lines).keys()].map((i) => {
      const timeText = format24h ? time.format('HH:mm') : time.format('HH:mm A');
      time.add(MINUTES_PER_BLOCK, 'minutes');
      return (
        <View key={timeText}>
          <Text style={[styles.timeLabel, { top: BLOCK_HEIGHT * i - 6 }]}>
            {timeText}
          </Text>
          <View style={[styles.line, { top: BLOCK_HEIGHT * i, width: width - 20 }]} />
        </View>
      );
    });
  };

  const eventTappedHandler = (event) => { onEventTapped(event); };

  const renderEvents = () => {
    const componentEvents = packedEvents.map((event, i) => {
      if (event.booking_type === "blocked") return null;
      const style = {
        left: event.left,
        height: event.height,
        width: event.width,
        top: event.top,
      };

      const eventColor = {
        backgroundColor: event.color,
        boderColor: event.boderColor,
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

  const rotatedLenght = (lenght) => (Math.sqrt(2 * (lenght ** 2)));
  

  const renderBlocks = () => {
    const lineWidth = 4;
    const lineMargin = 8;
    return blockedEvents.map((event) => {
      const startTime = moment(event.start);
      const endTime = moment(event.end);
      const dayStartTime = startTime.clone().hour(start).minute(0);

      const top = startTime.diff(dayStartTime, 'minutes', true) * HEIGHT_PER_MINUTE;
      const height = endTime.diff(startTime, 'minutes', true) * HEIGHT_PER_MINUTE;


      const rotatedLineWidth = rotatedLenght(lineWidth);
      const rotatedLineMargin = rotatedLenght(lineMargin);
      const rotatedHeight = rotatedLenght(height);

      const blockWidth = width - LEFT_MARGIN + height;

      const linesQuantity = Math.floor(((blockWidth) / (rotatedLineWidth + rotatedLineMargin)) * 2.1);

      const lines = [...Array(linesQuantity)].map((i) => (
        <View
          key={i}
          style={[
            styles.blockedLine,
            {
              width: lineWidth,
              marginRight: lineMargin,
              height: rotatedHeight,
              left: height * -1,
            },
          ]}
        />
      ));
      return (
        <View
          style={[
            styles.blockedContainer,
            {
              height,
              top,
              marginLeft: LEFT_MARGIN,
            },
          ]}
          key={event.id}
        >
          {lines}
        </View>
      );
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.contentStyle, { width }]}
      showsVerticalScrollIndicator={false}
      contentOffset={{ y: contentOffset() }}
      ref={scrollViewRef}
      refreshControl={refreshControl}
    >
      {renderBlocks()}
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
