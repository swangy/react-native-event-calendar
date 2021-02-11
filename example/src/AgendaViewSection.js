import React, { Component } from 'react';
import { View, SectionList, ActivityIndicator, StyleSheet } from 'react-native';
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'
import { indexByDate } from './utils';

// Get index if sections and data where flattened
// SectionView's intitialScrollIndex prop use a index like every data and 
// sections is flattened, rather than select a section index and a item index

function indexFlattedByDate(events, date) {
  const dateIndex = indexByDate(events, date);

  let flattedIndex = 0;

  for (let index = 0; index < dateIndex; index++) {
    flattedIndex += events[index].data.length;
    flattedIndex += index > 0 ? 2 : 1;
  }
  return flattedIndex;
}

// Delete blocked events and add a "empty" event when the list is empty
// This is when the date is part of the sections, but no events are listed
// With this is possible to render a "No Bookings"
// If you don't want to render a specific date, don't include it in the events prop
function prepareEvents(events) {
  return events.map((element) => {
    const event = {}
    event.date = element.date;

    const filteredArray = element.data.filter((e) => e.booking_type !== 'blocked');
    if (filteredArray.length === 0) {
      filteredArray.push({ booking_type: 'empty' });
    }

    event.data = filteredArray;
    return event;
  });
}

class AgendaViewSection extends Component {
  constructor(props) {
    super(props);

    const preparedEvents = prepareEvents(props.events)
    const initialIndex = indexFlattedByDate(preparedEvents, props.initialDate);

    this.state = {
      currentDate: props.initDate,
      currentIndex: initialIndex,
      events: preparedEvents,
      initialIndex,
    };

    this.onDateChange = this.onDateChange.bind(this);
    this.onScroll = this.onScroll.bind(this);

    this.flatListRef = React.createRef();
    this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
    this.onEndReached = this.onEndReached.bind(this);

    // Different components Height is mandatory to compute correctly intial date position
    this.getItemLayout = sectionListGetItemLayout({
      // The height of the row with rowData at the given sectionIndex and rowIndex
      getItemHeight: (rowData, sectionIndex, rowIndex) => props.itemHeight,

      getSeparatorHeight: () => 0,
      getSectionHeaderHeight: () => props.sectionHeaderHeight,
      getSectionFooterHeight: () => 1,
      listHeaderHeight: 0,
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.events !== this.props.events) {
      const preparedEvents = prepareEvents(this.props.events)
      const newIndex = indexFlattedByDate(preparedEvents, this.state.currentDate);
      this.setState({
        events: preparedEvents,
        currentIndex: newIndex,
        limitReached: false,
        initialIndex: newIndex,
      });
    }
  }

  keyExtractor(item) {
    return item.id
  }

  goToDate(date) {
    const { events } = this.state;

    this.flatListRef.current.scrollToLocation({
      sectionIndex: indexByDate(events, date),
      itemIndex: 0,
      animated: false,
    })
  }

  onDateChange(newDate) {
    const newIndex = indexByDate(this.props.events, newDate)
    this.setState({
      currentDate: newDate,
      currentIndex: newIndex,
    })

    this.props.onDateChange(newDate);
  }

  // Method that triggers everytime onScroll
  // Checks if the scrollView reach the top
  // If reachs the top, notify that limit is reached with -1
  // That means the top limit is reached (like a negative index)

  onScroll({ nativeEvent }) {
    if (nativeEvent.contentOffset.y > 0) return;
    if (this.state.limitReached) return;

    this.setState({ limitReached: true });
    this.props.onLimitReached(-1);
  }

  // Method that triggers every time a items change "visibility"
  // Check if first vissible item changes and check if the date is different

  onViewableItemsChanged({ viewableItems }) {
    if (!viewableItems.length) return;
    const viewableDate = viewableItems[0].section.date;
    if (viewableDate === this.state.currentDate) return;

    this.setState({ currentDate: viewableDate });
    this.props.onDateChange(viewableDate);
  }

  // Triggers just one time when the view reach the end
  // Notify that limit is reached with 1, that it means the bottom limit was reached

  onEndReached() {
    const { limitReached } = this.state;

    if (limitReached) return;
    this.setState({ limitReached: true });
    this.props.onLimitReached(1);
  }

  // Always render a Loader to make the impression of a fetching indicator 
  // that is part of the scroll
  footerLoader() {
    return (
      <ActivityIndicator size="large" style={styles.footer}/>
    )
  }

  render() {
    const { events, initialIndex } = this.state;
    const { width, loading, renderSectionHeader, renderEvent, renderDayFooter } = this.props;

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
          renderItem={renderEvent}
          renderSectionHeader={renderSectionHeader}
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
          renderSectionFooter={renderDayFooter}
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
