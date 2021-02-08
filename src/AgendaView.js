import React, { Component, memo } from 'react';
import { View, Text } from 'react-native';
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'
import { FlatList } from '@stream-io/flat-list-mvcp';
import AgendaEvent from './AgendaEvent';
import { DAY_IN_MILISECONDS } from './constants';
import Event from './EventComponent';
import { dateToString, indexByDate, newDate } from './utils';
import withDateIndex from './withDateIndex';
import moment from 'moment';

const ITEM_HEIGHT = 70;

function indexFlattedByDate(events, date) {
  const dateIndex = indexByDate(events, date);

  let flattedIndex = 0;

  for (let index = 0; index < dateIndex; index++) {
    flattedIndex += events[index].data.length;
  }
  return flattedIndex;
}

function flatEvents(events) {
  let flattedEvents = [];
  events.forEach((event) => {
    const eventData = event.data.slice();
    eventData[0].first = true;
    eventData[eventData.length - 1].last = true;
    flattedEvents = flattedEvents.concat(eventData);
  });
  return flattedEvents;
}

class AgendaView extends Component {
  constructor(props) {
    super(props);

    const initialIndex = indexByDate(props.events, props.initDate);
    const currentDate = props.initDate;

    this.indexLimit = 0;

    this.state = {
      currentDate,
      currentIndex: initialIndex,
      events: props.events,
      // flattedEvents: flatEvents(props.events),
      // events: initialEvents,
    };

    this.initialIndex = initialIndex;

    this.onDateChange = this.onDateChange.bind(this);
    this.onScroll = this.onScroll.bind(this);

    this.flatListRef = React.createRef();
    this.renderEvent = this.renderEvent.bind(this);
    this.getItemLayout = this.getItemLayout.bind(this);
  }

  // static getDerivedStateFromProps(props, state) {
  //   if (props.events !== state.events) {
  //     console.log("current index", state.currentIndex);
  //     console.log("current date", state.currentDate);
  //     console.log("new index", indexFlattedByDate(props.events, state.currentDate));
  //     return {
  //       events: props.events,
  //       flattedEvents: flatEvents(props.events),
  //       currentIndex: indexFlattedByDate(props.events, state.currentDate),
  //     };
  //   }

  //   return null;
  // }

  componentDidUpdate(prevProps, prevState) {
    console.log("did update")
    if (prevProps.events !== this.props.events) {
      console.log("Update events");
      this.setState({
        events: this.props.events,
        flattedEvents: flatEvents(this.props.events),
        currentIndex: indexFlattedByDate(this.props.events, this.state.currentDate),
      });
    }

    // if (prevState.events !== this.state.events && prevState.currentIndex === 0) {
    //   console.log("past index", prevState.currentIndex);
    //   console.log("scroll to index", this.state.currentIndex);
    //   // this.flatListRef.current.scrollToIndex({
    //   //   index: this.state.currentIndex,
    //   //   animated: false,
    //   // });
    //   console.log("scroll to offset", this.state.currentIndex * this.props.itemHeight)
    //   this.flatListRef.current.scrollToOffset({
    //     offset: this.state.currentIndex * this.props.itemHeight,
    //     animated: false,
    //   })
    // }
  }

  renderEvent({item}) {
    return (
      <AgendaEvent
        event={item}
        onEventPress={this.props.onEventPress}
      />
    )
  }

  keyExtractor(item) {
    return item.id
  }

  getItemLayout(data, index) {
    return {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
  }

  onDateChange(newDate) {
    const newIndex = indexByDate(this.props.events, newDate)
    this.setState({
      currentDate: newDate,
      currentIndex: newIndex,
    })

    this.props.onDateChange(newDate);
    this.checkIndexLimit(newIndex);
  }

  checkIndexLimit(index) {
    const { events } = this.props;

    if (index <= this.indexLimit || (events.length - 1 - index) <= this.indexLimit) {
      const direction = index <= this.indexLimit ? -1 : 1;
      this.props.onLimitReached(direction)
    }
  }

  onScroll({ nativeEvent }) {
    const { contentOffset: { y }, layoutMeasurement: { height } } = nativeEvent;
    this.checkDateChange(y);
    this.checkLimits(y, height);
    console.log(y);
  }

  checkDateChange(y) {
    const { currentIndex, flattedEvents } = this.state;
    const { onDateChange, itemHeight } = this.props;
    const index = Math.floor(y / itemHeight);
    if (index === currentIndex || index < 0) return;
    const date = moment(flattedEvents[index].start).format('YYYY-MM-DD');

    this.setState({
      currentDate: date,
      currentIndex: index,
    })

    onDateChange(date);
  }

  checkLimits(y, height) {
    const { flattedEvents, limitReached } = this.state;
    const { itemHeight, onLimitReached } = this.props;
    const bottom = y + height;
    const limit = itemHeight * 5;

    if (limitReached) return;
    if (y <= limit || bottom >= flattedEvents.length * itemHeight) {
      this.setState({limitReached: true });
      onLimitReached(y > limit ? 1 : -1);
    } 
  }

  onScrollToIndexFailed() {
    console.log("Scroll to index failed");
  }


  render() {

    const { initialIndex, flattedEvents } = this.state;
    const { width } = this.props;
    console.log("render");

    return (
      <View style={{ flex: 1, width }}>
        {/* <FlatList
          data={flattedEvents}
          renderItem={this.renderEvent}
          keyExtractor={this.keyExtractor}
          getItemLayout={this.getItemLayout}
          // ref={this.flatListRef}
          initialScrollIndex={initialIndex}
          onScroll={this.onScroll}
          maintainVisibleContentPosition={{ minIndexForVisible: 0, autoscrollToTopThreshold: -100 }}
          windowSize={200}
        /> */}
      </View>
    );
  }
}

const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.events === nextProps.events
}

const memoizedAgendaView = React.memo(AgendaView, arePropsEqual);

// const AgendaViewWithDateIndex = withDateIndex(memoizedAgendaView);

export default memoizedAgendaView;
