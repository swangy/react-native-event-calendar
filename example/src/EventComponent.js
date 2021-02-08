import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import moment from 'moment';

const EventComponent = ({
    onPress,
    event,
    renderEvent,
    calendar,
    style,
}) => {

  const formatHour = (date) => (moment(date).format('HH:mm'));
  const onPresshandler = () => onPress(event);

  if (event.booking_type === 'empty') {
    return (
      <View style={[styles.empty, style]}>
        <Text>No events booked</Text>
      </View>
    )
  }

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPresshandler}
      key={event.id}
      style={[styles.event, calendar && styles.calendar, style ]}
    >
      <Text style={styles.text}>{event.title}</Text>
      <Text style={styles.text}>{`${formatHour(event.start)} - ${formatHour(event.end)}`}</Text>
      <Text style={styles.text}>{event.subtitle}</Text>
    </TouchableOpacity>
  )
};

const MemoizedEvent = React.memo(EventComponent)

export default MemoizedEvent;

const styles = StyleSheet.create({
  event: {
    backgroundColor: '#4287f5',
    opacity: 1,
    borderColor: '#4287f5',
    borderWidth: 0.5,
    borderRadius: 10,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  calendar: {
    position: 'absolute',
    overflow: 'hidden',
  },
  text: {
    color: 'white',
  },
  empty: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});