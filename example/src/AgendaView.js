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

    const style = {
      height: 150,
      width: '100%',
      backgroundColor: item.color,
      boderColor: item.boderColor,
    }

    return (
      <Event
        event={item}
        onPress={this.props.onEventPress}
        style={style}
        renderEvent={this.props.renderEvent}
      />
    )
  }

  keyExtractor(item) {
    return item.id.toString()
  }

  renderEmptyComponent() {
    return (
      <Text>vacia :c</Text>
    )
  }

  render() {

    return (
      <SectionList
        sections={this.props.events}
        renderItem={this.renderEvent}
        keyExtractor={keyExtractor}
        // ItemSeparatorComponent={itemSeparatorComponent}
        ListEmptyComponent={renderEmptyComponent}
      />
    );
  }
}

export default AgendaView;
