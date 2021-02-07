import React, { Component, memo } from 'react';
import { View, Text, SectionList, ActivityIndicator, StyleSheet } from 'react-native';
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
  console.log("date index", dateIndex);

  let flattedIndex = 0;

  for (let index = 0; index < dateIndex; index++) {
    flattedIndex += events[index].data.length;
    flattedIndex += index > 0 ? 2 : 1;
  }
  return flattedIndex;
}

class AgendaViewSection extends Component {
  constructor(props) {
    super(props);

    const initialIndex = indexFlattedByDate(props.events, props.initialDate);

    this.state = {
      currentDate: props.initDate,
      currentIndex: initialIndex,
      events: props.events,
      initialIndex,
    };

    this.onDateChange = this.onDateChange.bind(this);
    this.onScroll = this.onScroll.bind(this);

    this.flatListRef = React.createRef();
    this.renderEvent = this.renderEvent.bind(this);
    this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
    this.onEndReached = this.onEndReached.bind(this);

    this.getItemLayout = sectionListGetItemLayout({
      // The height of the row with rowData at the given sectionIndex and rowIndex
      getItemHeight: (rowData, sectionIndex, rowIndex) => {
        return 70
      },

      // These four properties are optional
      getSeparatorHeight: () => 0 , // The height of your separators
      getSectionHeaderHeight: () => 20, // The height of your section headers
      getSectionFooterHeight: () => 0, // The height of your section footers
      listHeaderHeight: 0, // The height of your list header
    })
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
      const newIndex = indexFlattedByDate(this.props.events, this.state.currentDate);
      this.setState({
        events: this.props.events,
        currentIndex: newIndex,
        limitReached: false,
        initialIndex: newIndex,
      });

    }
  }

  //   // if (prevState.events !== this.state.events && prevState.currentIndex === 0) {
  //   //   console.log("past index", prevState.currentIndex);
  //   //   console.log("scroll to index", this.state.currentIndex);
  //   //   // this.flatListRef.current.scrollToIndex({
  //   //   //   index: this.state.currentIndex,
  //   //   //   animated: false,
  //   //   // });
  //   //   console.log("scroll to offset", this.state.currentIndex * this.props.itemHeight)
  //   //   this.flatListRef.current.scrollToOffset({
  //   //     offset: this.state.currentIndex * this.props.itemHeight,
  //   //     animated: false,
  //   //   })
  //   // }
  // }

  renderEvent({item}) {
    return (
      <AgendaEvent
        event={item}
        onEventPress={this.props.onEventPress}
      />
    )
  }

  renderSectionHeader({section}) {
    return (
      <Text style={{height: 20 }}>{section.date}</Text>
    )
  }

  keyExtractor(item) {
    return item.id
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
    const { contentOffset: { y } } = nativeEvent;

    const { limitReached } = this.state;
    const { onLimitReached } = this.props;
    const limit = 0;

    if (limitReached) return;
    if (y <= limit) {
      this.setState({ limitReached: true });
      onLimitReached(-1);
    }
  }

  onViewableItemsChanged({ viewableItems }) {
    const { currentDate } = this.state;
    const { onDateChange } = this.props;
    if (!viewableItems[0]) return;
    const viewableDate = viewableItems[0].section.date;
    if (viewableDate === currentDate) return;

    this.setState({ currentDate: viewableDate });
    onDateChange(viewableDate);
  }

  onEndReached() {
    const { limitReached } = this.state;

    if (limitReached) return;
    this.setState({ limitReached: true });
    this.props.onLimitReached(1);
  }

  footerLoader() {
    return (
      <ActivityIndicator size="large" style={styles.footer}/>
    )
  }

  render() {
    const { events, initialIndex } = this.state;
    const { width, loading, footerLoading } = this.props;

    if (loading) {
      return (
        <View style={[styles.container, { width }]}>
          <View style={styles.activityContainer}> 
            <ActivityIndicator size="large" />
          </View>
        </View>
      )
    }

    return (
      <View style={{ flex: 1, width }}>
        <SectionList
          sections={events}
          renderItem={this.renderEvent}
          renderSectionHeader={this.renderSectionHeader}
          keyExtractor={this.keyExtractor}
          getItemLayout={this.getItemLayout}
          ref={this.flatListRef}
          initialScrollIndex={initialIndex}
          stickySectionHeadersEnabled
          onViewableItemsChanged={this.onViewableItemsChanged}
          onScroll={this.onScroll}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.1}
          ListFooterComponent={this.footerLoader}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  activityContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  footer: {
    margin: 16,
    height: 50,
  }
});



// const arePropsEqual = (prevProps, nextProps) => {
//   return prevProps.events === nextProps.events
// }

// const memoizedAgendaViewSection = React.memo(AgendaViewSection, arePropsEqual);

// const AgendaViewSectionWithDateIndex = withDateIndex(memoizedAgendaViewSection);

export default AgendaViewSection;
