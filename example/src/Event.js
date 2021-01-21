import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Event = ({
    onPress,
    event,
    style,
    renderEvent
}) => {

  const onPresshandler = () => onPress(event)

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPresshandler}
      key={event.id}
      style={[styles.event, style ]}
    >
      {renderEvent(event)}
    </TouchableOpacity>
  )
};

const MemoizedEvent = React.memo(Event)

export default MemoizedEvent;

const styles = StyleSheet.create({
  event: {
    position: 'absolute',
    backgroundColor: '#F0F4FF',
    opacity: 0.8,
    borderColor: '#DDE5FD',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 4,
    minHeight: 25,
    flex: 1,
    paddingTop: 5,
    paddingBottom: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
});