import React, { Component } from 'react';
import { View, Text, SectionList } from 'react-native';
import Event from './Event';

class AgendaView extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.renderEvent = this.renderEvent.bind(this);
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

  renderSectionHeader({section}) {
    return (
      <View style={{backgroundColor: 'white'}}>
        <Text>{section.date}</Text>
      </View>
    )
  }

  keyExtractor(item) {
    console.log("key extractor", item.id)
    return item.id
  }

  renderEmptyComponent() {
    return (
      <View style={{backgroundColor: 'white'}}>
        <Text>vacia :c</Text>
      </View>
    )
  }

  render() {

    return (
      <View style={{ flex:1, width: this.props.width }}>
        <SectionList
          sections={this.props.events}
          renderItem={this.renderEvent}
          keyExtractor={this.keyExtractor}
          // ItemSeparatorComponent={itemSeparatorComponent}
          ListEmptyComponent={this.renderEmptyComponent}
          renderSectionHeader={this.renderSectionHeader}
          stickySectionHeadersEnabled
        />
      </View>
    );
  }
}

export default AgendaView;
