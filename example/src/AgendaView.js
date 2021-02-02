import React, { Component } from 'react';
import { View, Text, SectionList, FlatList } from 'react-native';
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'
import AgendaEvent from './AgendaEvent';
import { DAY_IN_MILISECONDS } from './constants';
import Event from './EventComponent';
import { dateToString, indexByDate, newDate } from './utils';
import withDateIndex from './withDateIndex';

const ITEM_HEIGHT = 70;


class AgendaView extends Component {
  constructor(props) {
    super(props);

    this.scrollViewRef = React.createRef()
    this.renderEvent = this.renderEvent.bind(this);
    this.getItemLayout = this.getItemLayout.bind(this);
  }

  renderEvent({item}) {
    return (
      <AgendaEvent
        event={item}
        onEventPress={this.props.onEventPress}
      />
    )
  }

  scrollToIndex(index) {
    this.scrollViewRef.current.scrollToLocation({
      sectionIndex: index,
      itemIndex: 0,
      animated: 0,
      viewPosition: 0,
    });
  }

  keyExtractor(item) {
    return item.id
  }

  getItemLayout(data, index) {
    return {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
  }

  render() {
    return (
      <View style={{ flex: 1, width: this.props.width }}>
        <FlatList
          data={this.props.events}
          renderItem={this.renderEvent}
          keyExtractor={this.keyExtractor}
          getItemLayout={this.getItemLayout}
          ref={this.scrollViewRef}
          initialScrollIndex={this.props.initialIndex}
          onScroll={this.props.onScroll}
        />
      </View>
    );
  }
}

const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.events === nextProps.events
}

const memoizedAgendaView = React.memo(AgendaView, arePropsEqual);

const AgendaViewWithDateIndex = withDateIndex(memoizedAgendaView);

export default AgendaViewWithDateIndex;
