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
import {HEIGHT_PER_MINUTE} from './constants';

const DAY_IN_MILISECONDS = 86400000
export default class EventCalendar extends React.Component {
  // static dateByIndex(index, initDate, size) {
  //   return moment.utc(initDate).add(index - size, 'days').format('YYYY-MM-DD');
  // }

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

  constructor(props) {
    super(props);
    const start = props.start || 0;
    const end = props.end || 24;

    const initialIndex = EventCalendar.indexByDate(props.events, props.initDate);

    this.state = {
      currentDate: props.initDate,
      currentIndex: initialIndex,
      initialIndex: initialIndex,
    }


    this.calendarStyle = styleConstructor(props.styles, (end - start) * 60 * HEIGHT_PER_MINUTE);

    this.calendarRef = React.createRef();
    this.getItemLayout = this.getItemLayout.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.onScrollHandler = this.onScrollHandler.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.events === state.events) return null;
    return {
      events: props.events,
      currentIndex: EventCalendar.indexByDate(props.events, state.currentDate),
    }
  }

  componentDidUpdate(prevProps) {
    if(prevProps.events !== this.props.events) {
      console.log("Update!")
      this.calendarRef.current.scrollToIndex({animated: false, index: this.state.currentIndex})
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

  // renderItem({ index, item }) {
  //   const {
  //     initDate, size, formatHeader, width,
  //     format24h, headerStyle, renderEvent, onEventTapped, scrollToFirst, start, end,
  //     refreshControl, startKey, endKey
  //   } = this.props;
  //   const date = EventCalendar.dateByIndex(index, initDate, size);

  //   return (
  //     <View style={[this.calendarStyle.container, { width }]}>
  //       <DayView
  //         date={date}
  //         index={index}
  //         format24h={format24h}
  //         formatHeader={formatHeader}
  //         headerStyle={headerStyle}
  //         renderEvent={renderEvent}
  //         onEventTapped={onEventTapped}
  //         events={item}
  //         width={width}
  //         styles={this.calendarStyle}
  //         scrollToFirst={scrollToFirst}
  //         start={start}
  //         end={end}
  //         refreshControl={refreshControl}
  //         startKey={startKey}
  //         endKey={endKey}
  //       />
  //     </View>
  //   );
  // }

  renderItem({item}) {
    const {width} = this.props;
    return (
      <View style={[styles.itemContainer, {width}]}>
        <Text>{item.date}</Text>
      </View>
    )
  }

  render() {
    const { width } = this.props;
    return (
      <View style={[this.calendarStyle.container, { width }]}>
        <FlatList
          ref={this.calendarRef}
          windowSize={8}
          initialNumToRender={3}
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
};
