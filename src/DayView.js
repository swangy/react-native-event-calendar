// @flow
import { View, Text, ScrollView, Platform } from 'react-native';
import React, { useEffect } from 'react';
import moment from 'moment';
import _ from 'lodash';
import populateEvents from './Packer';
import { BLOCK_HEIGHT } from './constants';
import { nowTop, heightPerMinute } from './utils';

const LEFT_MARGIN = 60 - 1;
function range(from, to) {
  return Array.from(Array(to), (_, i) => from + i);
}


const DayView = React.forwardRef(({
  date,
  end,
  events,
  format24h,
  renderEvent,
  start,
  styles,
  width,
  refreshControl,
  startKey,
  endKey,
  orderEvents,
  onMomentumScrollEnd,
  onScrollEndDrag,
  contentOffset,
  minutesPerBlock
}, ref) => {
  const containerWidth = width - LEFT_MARGIN;
  const blockedEvents = events.filter((e) => e.booking_type === 'blocked');
  const normalEvents = events.filter((e) => e.booking_type !== 'blocked');
  const packedEvents = populateEvents(normalEvents, containerWidth, start, startKey, endKey, orderEvents, minutesPerBlock);

  useEffect(() => {
    if (Platform.OS === 'ios') return;
    setTimeout(() => {
      if (!ref.current) return;
      ref.current.scrollTo({ y: contentOffset, animated: false });
    }, 0);
  }, []);

  const renderRedLine = () => {
    const now = moment();
    if (!now.isSame(date, 'day')) return null;
    const top = nowTop(start, minutesPerBlock);
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
    const lines = Math.floor(((end - start) * 60) / minutesPerBlock);
    return [...Array(lines).keys()].map((i) => {
      const timeText = format24h ? time.format('HH:mm') : time.format('HH:mm A');
      time.add(minutesPerBlock, 'minutes');
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


  const renderEvents = () => {
    const componentEvents = packedEvents.map((event, i) => {
      if (event.booking_type === "blocked" || event.booking_type === "empty") return null;
      
      const style = {
        left: event.left,
        height: event.height,
        width: event.width,
        top: event.top,
      };


      return renderEvent({event, style})
    });

    return (
      <View style={{ marginLeft: LEFT_MARGIN }}>{componentEvents}</View>
    );
  };

  const rotatedLenght = (lenght) => (Math.sqrt(2 * (lenght ** 2)));
  

  const renderBlocks = () => {
    const lineWidth = 4;
    const lineMargin = 8;
    return blockedEvents.filter((event) => { 
      return moment(event[endKey]).hour() >= start && moment(event[startKey]).hour() <= end;
    }).map((event) => {
      const eventStart = moment(event[startKey]);
      const eventEnd = moment(event[endKey]);
      const dayStartTime = eventStart.clone().hour(start).minute(0);

      const blockStart = eventStart.hour() < start ? dayStartTime : eventStart;
      const blockEnd = eventEnd.hour() > end ? eventStart.clone().hour(end).minute(0) : eventEnd;

      const top = blockStart.diff(dayStartTime, 'minutes', true) * heightPerMinute(minutesPerBlock);
      const height = blockEnd.diff(blockStart, 'minutes', true) * heightPerMinute(minutesPerBlock);


      const rotatedLineWidth = rotatedLenght(lineWidth);
      const rotatedLineMargin = rotatedLenght(lineMargin);
      const rotatedHeight = rotatedLenght(height);

      const blockWidth = width - LEFT_MARGIN + height;

      const linesQuantity = Math.floor(((blockWidth) / (rotatedLineWidth + rotatedLineMargin)) * 2.1);

      let lines = [];

      for (let index = 1; index <= linesQuantity; index++) {
        lines.push(
          <View
            key={index}
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
        )
      }

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
    <View style={{ flex:1, width }}>
      <ScrollView
        contentContainerStyle={[styles.contentStyle, { width }]}
        showsVerticalScrollIndicator
        contentOffset={{ y: contentOffset }}
        refreshControl={refreshControl}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
        ref={ref}
      >
        {renderBlocks()}
        {renderLines()}
        {renderEvents()}
        {renderRedLine()}
      </ScrollView>
    </View>
  );
});

const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.events === nextProps.events
}
const MemoizedDayView = React.memo(DayView, arePropsEqual)

export default MemoizedDayView;
