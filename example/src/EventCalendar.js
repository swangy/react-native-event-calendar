// @flow
import {
  VirtualizedList,
  View,
  TouchableOpacity,
  Image,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import React from 'react';

import styleConstructor from './style';

import DayView from './DayView';
import { heightPerMinute, nowTop } from './utils';

const DAY_IN_MILISECONDS = 86400000
export default class EventCalendar extends React.Component {

  static addZero(number) {
  return number >= 10 ? number : `0${number}`;
}

  static dateToString(date) {
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}`
}

  static newDate(dateString) { return  new Date(`${dateString}T00:00:00`) }

  static indexByDate(events, date) {
    const firstDate = EventCalendar.newDate(events[0].date)
    const indexDate = EventCalendar.newDate(date)
    return (indexDate.getTime() - firstDate.getTime()) / DAY_IN_MILISECONDS
  }

  static dateByIndex(events, index) { return events[index].date }

  static generateRefArray(length) {
    const refArray = []
    for (let index = 0; index < length; index++) {
      refArray.push(React.createRef())
    }
    return refArray
  }

  static currentHourOffset = (start, end, minutesPerBlock) => {
    const nowHour = new Date().getHours()
    if ((nowHour < (start + 1)) || (nowHour > (end + 1))) return 0;
    return nowTop(start, minutesPerBlock) - 100;
  };

  constructor(props) {
    super(props);
    const start = props.start || 0;
    const end = props.end || 24;

    const initialIndex = EventCalendar.indexByDate(props.events, props.initDate);

    this.state = {
      currentDate: props.initDate,
      currentIndex: initialIndex,
      initialIndex: initialIndex,
      currentY: EventCalendar.currentHourOffset(start, end, props.minutesPerBlock),
      events: props.events,
      refArray: EventCalendar.generateRefArray(props.events.length),
    }

    this.calendarStyle = styleConstructor(props.styles, (end - start) * 60 * heightPerMinute(props.minutesPerBlock));

    this.calendarRef = React.createRef();
    this.getItemLayout = this.getItemLayout.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.onScrollHandler = this.onScrollHandler.bind(this);
    this.onScrollEndHandler = this.onScrollEndHandler.bind(this);
    this.syncVerticalPosition = this.syncVerticalPosition.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.events === state.events) return null;
    return {
      events: props.events,
      currentIndex: EventCalendar.indexByDate(props.events, state.currentDate),
      refArray: EventCalendar.generateRefArray(props.events.length)
    }
  }

  syncVerticalPosition(index) {
    if (index < 0 || index > (this.state.refArray.length -1 )) return;
    if(this.state.refArray[index].current === null) return
    this.state.refArray[index].current.scrollTo({y: this.state.currentY, animated: false})
  }

  componentDidUpdate(prevProps, prevState) {

    if(prevProps.events !== this.props.events) {
      this.calendarRef.current.scrollToIndex({animated: false, index: this.state.currentIndex})
    }

    if(prevState.currentY !== this.state.currentY) {
      this.syncVerticalPosition(this.state.currentIndex + 1)
      this.syncVerticalPosition(this.state.currentIndex - 1)
    }

    if(prevState.currentIndex !== this.state.currentIndex) {
      this.syncVerticalPosition(this.state.currentIndex + 1)
      this.syncVerticalPosition(this.state.currentIndex - 1)
    }
  }

  getItem(eventList, index) {
    const { initDate, size } = this.props;
    const item = eventList[EventCalendar.dateByIndex(index, initDate, size)] || [];
    return item;
  }

  keyExtractor(item) { return item.date } ;

  getItemLayout(data, index) {
    const { width } = this.props;
    return { length: width, offset: width * index, index };
  }

  goToDate(date) {
    this.goToPage(EventCalendar.indexByDate(this.state.events, date));
  }

  goToPage(index) {
    if (index < 0 || index >= this.state.events.length) return;
    this.calendarRef.current.scrollToIndex({ index, animated: false });
  }

  onScrollHandler(event) {
    if(event.nativeEvent.contentOffset.x < 0) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / this.props.width);
    if(this.state.currentIndex === index) return;
    const date = EventCalendar.dateByIndex(this.state.events, index)
    this.setState({
      currentDate: date,
      currentIndex: index
    })
    this.props.onDateChange(date)
  }

  onScrollEndHandler(event) {
    this.setState({currentY: event.nativeEvent.contentOffset.y})
  }

  renderItem({ index, item }) {
    const {
      formatHeader, width,
      format24h, headerStyle, renderEvent, onEventTapped, scrollToFirst, start, end,
      refreshControl, startKey, endKey, minutesPerBlock, renderPressEvent, onLongPressOut
    } = this.props;


    return (
      <DayView
        date={item.date}
        index={index}
        format24h={format24h}
        formatHeader={formatHeader}
        headerStyle={headerStyle}
        renderEvent={renderEvent}
        onEventTapped={onEventTapped}
        events={item.data}
        width={width}
        styles={this.calendarStyle}
        start={start}
        end={end}
        refreshControl={refreshControl}
        startKey={startKey}
        endKey={endKey}
        onMomentumScrollEnd={this.onScrollEndHandler}
        onScrollEndDrag={this.onScrollEndHandler}
        ref={this.state.refArray[index]}
        contentOffset={this.state.currentY}
        minutesPerBlock={minutesPerBlock}
        renderPressEvent={renderPressEvent}
        onLongPressOut={onLongPressOut}
      />
    );
  }

  render() {
    const { width } = this.props;
    return (
      <View style={[this.calendarStyle.container, { width }]}>
        <FlatList
          ref={this.calendarRef}
          windowSize={8}
          initialNumToRender={1}
          initialScrollIndex={this.state.initialIndex}
          data={this.state.events}
          keyExtractor={this.keyExtractor}
          getItemLayout={this.getItemLayout}
          horizontal
          pagingEnabled
          renderItem={this.renderItem}
          style={{ width }}
          onScroll={this.onScrollHandler}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'red',
  }
})

EventCalendar.defaultProps = {
  end: 24,
  format24h: true,
  formatHeader: 'DD MMMM YYYY',
  initDate: new Date(),
  scrollToFirst: true,
  size: 30,
  start: 0,
  upperCaseHeader: false,
  onDateChange: null,
  minutesPerBlock: 30,
};
