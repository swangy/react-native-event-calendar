import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import moment from 'moment';
import EventComponent from './EventComponent';

const AgendaEvent = ({
  event, onEventPress,
}) => {
  return (
    <View style={styles.container}>
      <EventComponent
        event={event}
        onPress={onEventPress}
        style={styles.event}
      />
    </View>
  )
};

export default AgendaEvent;

const styles = StyleSheet.create({
  container: {
    height: 78,
    flexDirection: 'row',
    flex: 1,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  event: {
    paddingLeft: 16,
  }
});
