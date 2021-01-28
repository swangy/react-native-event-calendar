
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { dateByIndex, indexByDate, newDate } from './utils';

export default (WrappedComponent) => (
  class WithDateIndex extends Component {
    constructor(props) {
      super(props);

      const initialIndex = indexByDate(props.events, props.initDate)
      const currentIndex = initialIndex >= 0 ? initialIndex : 0;
      const currentDate = dateByIndex(props.events, currentIndex);

      this.state = {
        currentDate,
        currentIndex,
        initialIndex: currentIndex,
      }

      this.onDateChange = this.onDateChange.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
      return {
        currentIndex: indexByDate(props.events, state.currentDate),
      }
    }

    onDateChange(newDate) {
      this.setState({
        currentDate: newDate,
        currentIndex: indexByDate(this.props.events, newDate)
      })
      this.props.onDateChange(newDate);
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevProps.events !== this.props.events) {
        this.props.forwardedRef.current.scrollToIndex({animated: false, index: this.state.currentIndex})
      }
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          initialIndex={this.state.initialIndex}
          onDateChange={this.onDateChange}
          currentDate={this.state.currentDate}
        />
      )
    }
  }
);