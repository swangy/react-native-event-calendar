// @flow
import { View, Text, ScrollView, Platform, Pressable, Vibration } from 'react-native';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import populateEvents from './Packer';
import { BLOCK_HEIGHT } from './constants';
import { nowTop, heightPerMinute } from './utils';

const LEFT_MARGIN = 60 - 1;

class DayView extends React.Component {

  static rotatedLenght(lenght) { return Math.sqrt(2 * (lenght ** 2)) };

  constructor(props) {
    super(props);

    this.state = {
      newEventTop: null,
    }

    this.renderRedLine = this.renderRedLine.bind(this);
    this.onCalendarLongPress = this.onCalendarLongPress.bind(this);
    this.renderLines = this.renderLines.bind(this);
    this.renderEvents = this.renderEvents.bind(this);
    this.onCalendarLongPress = this.onCalendarLongPress.bind(this);
    this.onCalendarPressOut = this.onCalendarPressOut.bind(this);
    this.renderNewEvent = this.renderNewEvent.bind(this);
    this.renderBlocks = this.renderBlocks.bind(this);
    this.scrollTo = this.scrollTo.bind(this);

    this.scrollRef = React.createRef();
  }

  componentDidMount() {
    if (Platform.OS === 'ios') return;
    setTimeout(() => {
      if (!this.scrollRef.current) return;
      this.scrollRef.current.scrollTo({ y: this.props.contentOffset, animated: false });
    }, 0);
  };

  scrollTo(args) {
    this.scrollRef.current.scrollTo(args);
  }

  renderLines() {
    const { start, end, minutesPerBlock, format24h, styles, width } = this.props;
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

  renderEvents(packedEvents) {
    const { renderEvent } = this.props;
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

  onCalendarLongPress({ nativeEvent }) {
    Vibration.vibrate(70);
    this.setState({
      newEventTop: Math.floor(nativeEvent.locationY / BLOCK_HEIGHT) * BLOCK_HEIGHT,
    });
  };

  onCalendarPressOut() {
    const { newEventTop } = this.state;
    if (newEventTop === null) return;

    const { date, start, minutesPerBlock, onLongPressOut } = this.props;
    const newStart = moment(date);
    const blockIndex = newEventTop / BLOCK_HEIGHT;
    newStart.hour(start);
    newStart.add(blockIndex * minutesPerBlock, 'minutes');
    const newEnd = newStart.clone();
    newEnd.add(minutesPerBlock, 'minutes');

    onLongPressOut({
      start: newStart.format('YYYY-MM-DDTHH:mm:SS'),
      end: newEnd.format('YYYY-MM-DDTHH:mm:SS'),
    });
  };

  hideEmptyEvent() {
    this.setState({ newEventTop: null });
  }

  renderNewEvent() {
    const { newEventTop } = this.state;
    if (newEventTop === null) return null;
    const { renderPressEvent } = this.props;

    return (
      <Pressable
        style={{
          height: BLOCK_HEIGHT,
          position: 'absolute',
          top: newEventTop,
          flexDirection: 'row',
          width: '100%',
        }}
      >
        <View style={{ width: LEFT_MARGIN }} />
        {renderPressEvent()}
      </Pressable>
    );
  }

  renderBlocks(blockedEvents) {
    const { startKey, endKey, start, end, minutesPerBlock, width, styles } = this.props;
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


      const rotatedLineWidth = DayView.rotatedLenght(lineWidth);
      const rotatedLineMargin = DayView.rotatedLenght(lineMargin);
      const rotatedHeight = DayView.rotatedLenght(height);

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

  renderRedLine() {
    const { start, minutesPerBlock, width, date, styles } = this.props;
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

  render () {
    const {
      width, contentOffset, refreshControl, onMomentumScrollEnd, onScrollEndDrag, events,
      start, end, startKey, endKey, orderEvents, minutesPerBlock, styles
    } = this.props;

    const eventsContainerWidth = width - LEFT_MARGIN;
    const blockedEvents = events.filter((e) => e.booking_type === 'blocked');
    const packedEvents = populateEvents(
      events.filter((e) => e.booking_type !== 'blocked'),
      eventsContainerWidth,
      start,
      startKey,
      endKey,
      orderEvents,
      minutesPerBlock
    );

    return (
      <View style={{ flex: 1, width }}>
        <ScrollView
          contentContainerStyle={[styles.contentStyle, { width }]}
          showsVerticalScrollIndicator
          contentOffset={{ y: contentOffset }}
          refreshControl={refreshControl}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollEndDrag={onScrollEndDrag}
          ref={this.scrollRef}
        >
          <Pressable
            style={{ flex: 1 }}
            onLongPress={this.onCalendarLongPress}
            onPressOut={this.onCalendarPressOut}
            delayLongPress={200}
          >
            {this.renderBlocks(blockedEvents)}
            {this.renderLines()}
            {this.renderEvents(packedEvents)}
            {this.renderRedLine()}
            {this.renderNewEvent()}
          </Pressable>
        </ScrollView>
      </View>
    );
  }
}

const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.events === nextProps.events
}
const MemoizedDayView = React.memo(DayView, arePropsEqual)

export default MemoizedDayView;
