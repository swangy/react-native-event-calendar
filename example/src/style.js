// @flow
import { Platform, StyleSheet } from 'react-native';

// const eventPaddingLeft = 4
const leftMargin = 50 - 1;

export default function styleConstructor(theme = {}, calendarHeight) {
  const style = {
    container: {
      flex: 1,
      backgroundColor: '#ffff',
      ...theme.container,
    },
    contentStyle: {
      backgroundColor: '#ffff',
      height: calendarHeight + 24,
      marginTop: 16,
      ...theme.contentStyle,
    },
    header: {
      paddingHorizontal: 30,
      height: 50,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#E6E8F0',
      backgroundColor: '#F5F5F6',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      ...theme.header,
    },
    headerTextContainer: {
      justifyContent: 'center',
    },
    headerText: {
      fontSize: 16,
      ...theme.headerText,
    },
    arrow: {
      width: 15,
      height: 15,
      resizeMode: 'contain',
    },
    arrowButton: {
      width: 50,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.arrowButton,
    },
    event: {
      position: 'absolute',
      backgroundColor: '#4287f5',
      opacity: 0.8,
      borderColor: '#4287f5',
      borderWidth: 0.5,
      borderRadius: 8,
      minHeight: 25,
      flex: 1,
      flexDirection: 'column',
      alignItems: 'flex-start',
      overflow: 'hidden',
      ...theme.event,
    },
    eventTitle: {
      color: '#615B73',
      fontWeight: '600',
      minHeight: 15,
      ...theme.eventTitle,
    },
    eventSummary: {
      color: '#615B73',
      fontSize: 12,
      flexWrap: 'wrap',
      ...theme.eventSummary,
    },
    eventTimes: {
      marginTop: 3,
      fontSize: 10,
      fontWeight: 'bold',
      color: '#615B73',
      flexWrap: 'wrap',
      ...theme.eventTimes,
    },
    line: {
      height: 1,
      position: 'absolute',
      left: leftMargin,
      backgroundColor: 'rgb(216,216,216)',
      ...theme.line,
    },
    lineNow: {
      height: 1,
      position: 'absolute',
      left: leftMargin,
      backgroundColor: 'red',
      ...theme.lineNow,
    },
    circleNow: {
      height: 7,
      width: 7,
      borderRadius: 7,
      position: 'absolute',
      left: leftMargin,
      backgroundColor: 'red',
      ...theme.circleNow,
    },
    timeLabel: {
      position: 'absolute',
      left: 15,
      color: 'rgb(170,170,170)',
      fontSize: 10,
      fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
      fontWeight: '500',
      ...theme.timeLabel,
    },
    blockedLine: {
      transform: [{
        rotate: '45deg',
      }],
      backgroundColor: '#F6F6F6',
      ...theme.blockedLine,
    },
    blockedContainer: {
      position: 'absolute',
      width: '100%',
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.blockedContainer,
    },
  };
  return StyleSheet.create(style);
}
