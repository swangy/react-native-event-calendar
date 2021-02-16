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
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  event: {
    paddingLeft: 16,
    height: 70,
  }
});
