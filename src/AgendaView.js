import React, { Component } from 'react';
import { View, Text, SectionList } from 'react-native';
import Event from './Event';
import withDateIndex from './withDateIndex';

const ITEM_HEIGHT = 67.4;
const DATE_HEIGHT = 30;

class AgendaView extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.scrollViewRef = React.createRef()
    this.renderEvent = this.renderEvent.bind(this);
    this.getItemLayout = this.getItemLayout.bind(this);
    this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
  }

  renderEvent({item}) {

    return (
      <Event
        event={item}
        onPress={this.props.onEventPress}
        renderEvent={this.props.renderEvent}
      />
    )
  }

  // componentDidMount() {
  //   const wait = new Promise((resolve) => setTimeout(resolve, 0));
  //   wait.then( () => {
  //     this.scrollViewRef.current.scrollToLocation({
  //       sectionIndex: this.props.initialIndex,
  //       itemIndex: 0,
  //       animated: false,
  //       viewPosition: 0,
  //     })
  //   });
  // }

  scrollToIndex(index) {
    this.scrollViewRef.current.scrollToLocation({
      sectionIndex: index,
      itemIndex: 0,
      animated: false,
      viewPosition: 0,
    });
  }

  keyExtractor(item) {
    return item.id
  }

  getItemLayout(data, index) {
    return {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
  }

  renderEmptyComponent() {
    return (
      <View style={{backgroundColor: 'white'}}>
        <Text>vacia :c</Text>
      </View>
    )
  }

  onViewableItemsChanged({viewableItems}) {
    if(viewableItems[0].section.date === this.props.currentDate) return;
    this.props.onDateChange(viewableItems[0].section.date);
  }

  render() {

    return (
      <View style={{ flex: 1, width: this.props.width }}>
        <SectionList
          sections={this.props.events}
          renderItem={this.renderEvent}
          keyExtractor={this.keyExtractor}
          ItemSeparatorComponent={this.props.itemSeparatorComponent}
          renderSectionHeader={this.props.renderSectionHeader}
          stickySectionHeadersEnabled
          ref={this.scrollViewRef}
          onViewableItemsChanged={this.onViewableItemsChanged}
        />
      </View>
    );
  }
}

const AgendaViewWithDateIndex = withDateIndex(AgendaView)

export default AgendaViewWithDateIndex;
