import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Event = ({
    onPress,
    event,
    style,
    renderEvent,
    calendar
}) => {

  const onPresshandler = () => onPress(event)

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPresshandler}
      key={event.id}
      style={[styles.event, calendar && styles.calendar, style ]}
    >
      {renderEvent(event)}
    </TouchableOpacity>
  )
};

const MemoizedEvent = React.memo(Event)

export default MemoizedEvent;

const styles = StyleSheet.create({
  event: {
    backgroundColor: '#4287f5',
    opacity: 0.8,
    borderColor: '#4287f5',
    borderWidth: 0.5,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 8,
    marginHorizontal: 16,
  },
  calendar: {
    position: 'absolute',
    overflow: 'hidden',
    marginVertical: 0,
    marginHorizontal: 0
  },
  
});