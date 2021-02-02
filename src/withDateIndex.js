
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { dateByIndex, dateToString, indexByDate, newDate } from './utils';
import { DAY_IN_MILISECONDS } from './constants';
import moment from 'moment';

function generateEmptyEvents(initDate) {
  const startTime = newDate(initDate).getTime() - (DAY_IN_MILISECONDS * 30);
  const finalTime = newDate(initDate).getTime() + (DAY_IN_MILISECONDS * 30 * 6);
  const events = [];

  for (let time = startTime; time < finalTime; time += DAY_IN_MILISECONDS) {
    const date = new Date(time);
    events.push({
      date: dateToString(date),
      data: [{}]
    });
  }

  return events;
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

function indexFlattedByDate(events, date) {
  const dateIndex = indexByDate(events, date);

  let flattedIndex = 0;

  for (let index = 0; index < dateIndex; index++) {
    flattedIndex += events[index].data.length;
  }
  return flattedIndex;
} 

export default (WrappedComponent) => (
  class WithDateIndex extends Component {
    constructor(props) {
      super(props);

      this.wrappedRef = React.createRef();

      // const initialEvents = generateEmptyEvents(props.initialDate);

      const initialIndex = indexFlattedByDate(props.events, props.initialDate)
      const currentDate = props.initDate;
      const currentIndex = initialIndex >= 0 ? initialIndex : 0;

      this.indexLimit = 0;

      this.state = {
        currentDate,
        currentIndex,
        initialIndex: currentIndex,
        events: props.events,
        flattedEvents: flatEvents(props.events),
        // events: initialEvents,
      };

      this.onDateChange = this.onDateChange.bind(this);
      this.mergeEventsWithData = this.mergeEventsWithData.bind(this);
      this.onScroll = this.onScroll.bind(this);
    }

    // componentDidMount() {
    //   const events = this.mergeEventsWithData();
    //   this.setState({events});
    // }

    // static getDerivedStateFromProps(props,  ) {
    //   console.log("new index", indexByDate(props.events, state.currentDate));
    //   return {
    //     currentIndex: indexByDate(props.events, state.currentDate),
    //   }
    // }

    // componentDidUpdate(prevProps, prevState) {
    //   if (prevProps.events !== this.props.events) {
    //     this.wrappedRef.current.scrollToIndex(this.state.currentIndex)
    //   }
    // }

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

    mergeEventsWithData() {
      const newEvents = this.props.events.slice();
  
      Object.keys(this.props.events).forEach(date => {
        const index = indexByDate(this.props.events, date)
        newEvents[index].data = this.props.events[date]
      });
  
      return newEvents;
    }

    onScroll({ nativeEvent }) {
      const { contentOffset: { y }, layoutMeasurement: { height } } = nativeEvent;
      this.checkDateChange(y);
      this.checkLimits(y, height);
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

      if (limitReached) return;
      if (y <= 0 || bottom >= flattedEvents.length * itemHeight) {
        this.setState({limitReached: true });
        onLimitReached(y > 0 ? 1 : -1);
      } 


    }

    render() {

      return (
        <WrappedComponent
          {...this.props}
          currentDate={this.state.currentDate}
          events={this.state.flattedEvents}
          initialIndex={this.state.initialIndex}
          onDateChange={this.onDateChange}
          onScroll={this.onScroll}
          ref={this.wrappedRef}
        />
      )
    }
  }
);