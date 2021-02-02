import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import moment from 'moment';
import EventComponent from './EventComponent';

const AgendaEvent = ({
  event, onEventPress,
}) => {

  const date = moment(event.start);
  return (
    <View style={styles.container}>
      <View style={styles.date}>
        {event.first && (
          <>
            <Text>{date.format('dddd')}</Text>
            <Text>{date.format('D')}</Text>
          </>
        )}
      </View>
      <View style={styles.event}>
        <EventComponent
          event={event}
          onPress={onEventPress}
        />
      </View>
    </View>
  )
};

export default AgendaEvent;

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: 'row',
    flex: 1,
  },
  date: {
    flex: 1,
    alignItems: 'center',
  },
  event: {
    flex: 4,
  },
});
