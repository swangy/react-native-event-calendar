import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import moment from 'moment';

const DaySectionHeader = ({ date }) => {

  const momentDate = moment(date);
  const isToday = moment().isSame(momentDate, 'day');
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{momentDate.format('dddd')}</Text>
      <View style={[styles.circle, isToday && styles.today]}>
        <Text style={[styles.text, styles.date, isToday && styles.today]}>{momentDate.date()}</Text>
      </View>
    </View>
  );
}

export default DaySectionHeader;

const styles = StyleSheet.create({
  container: {
    height: 40,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingLeft: 16,
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  circle: {
    height: 26,
    width: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  today: {
    backgroundColor: '#22C488',
    color: 'white'
  },
  day: {
    color: '#535353',
  },
  date: {
    fontWeight: '700',
    color: '#535353',
  },
});
