import React, { useRef, useState } from 'react';
import { Button, Dimensions, SafeAreaView, Text, TextInput, useWindowDimensions, View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import moment from 'moment';
import { EventCalendar, AgendaView } from './src';
import { DAY_IN_MILISECONDS } from './src/constants';
import AgendaViewSection from './src/AgendaViewSection';

import { dateToString, newDate } from './src/utils';
import DaySectionHeader from './src/DaySectionHeader';
import AgendaEvent from './src/AgendaEvent';
import EventComponent from './src/EventComponent';
import EmptyEvent from './src/EmptyEvent';

function addZero(number) {
  return number >= 10 ? number : `0${number}`;
}

function generateDate(date, hour, min) {
  return `${date} ${addZero(hour)}:${addZero(min)}:00`;
}

function generateDateKey(date) {
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}`
}

function generateEvents(startDate, days) {
  const events = [];
  const currentDate = moment(startDate);
  for (let day = 0; day < days; day++) {
    events.push({
      data: day === days - 1 ? generateBlockedEvent() : generateEventsByDate(currentDate),
      date: currentDate.format('YYYY-MM-DD'),
    })
    currentDate.add(1, 'day');
  }

  return events;
}

const generateEventsByDate = (momentDate) => {

  let id = 1;

  const dayEvents = []
  const date = momentDate.format('YYYY-MM-DD');
  for (let hour = 0; hour < 2; hour++) {

    dayEvents.push({
      start: generateDate(date, hour, 0),
      end: generateDate(date, hour + 1, 0),
      booking_type: 'blocked',
      title: 'Rodrigo Monsalve',
      subtitle: 'Corte de pelo',
      id: `${date}-${id}`,
    })
    
    id+=1

    dayEvents.push({
      start: generateDate(date, hour, 0),
      end: generateDate(date, hour, 30),
      booking_type: 'booking',
      title: 'Rodrigo Monsalve',
      subtitle: 'Corte de pelo',
      id: `${date}-${id}`,
    })

    id+=1

    dayEvents.push({
      start: generateDate(date, hour, 30),
      end: generateDate(date, hour + 1, 0),
      booking_type: 'booking',
      title: 'Rodrigo Monsalve',
      subtitle: 'Corte de pelo',
      id: `${date}-${id}`,
    })

    id+=1
     
  }

  return dayEvents;
}

const generateBlockedEvent = () => ([{
  booking_type: 'blocked',
}])
 

const App = () =>  {
  
  const today = moment().format('YYYY-MM-DD');
  const twoDaysAgo = moment().subtract(2, 'day').format('YYYY-MM-DD');
  const [events, setEvents] = useState(generateEvents(twoDaysAgo, 5));
  const [date, setDate] = useState(today);
  const [goToDate, setGoToDate] = useState('');
  const [mode, setMode] = useState('day');
  const [fetching, setFetching] = useState(false);
  const [minutesPerBlock, setMinutesPerBlock] = useState(15);
  const [minutes, setMinutes] = useState('15');
  const [loading, setLoading] = useState(false);

  const calendarRef = useRef(null);
  const agendaRef = useRef(null);

  const width = Dimensions.get('window').width;


  const goToDateHandler = () => {
    if (mode === 'agenda') {
      agendaRef.current.goToDate(goToDate);
    } else {
      calendarRef.current.goToDate(goToDate);
    }
  }

  const onEventTapped = (event) => {console.log("omg omg ogm")};

  const onDateChange = (newDate) => {
    setDate(newDate)
  }

  const toggleMode = () => {
    mode === 'agenda' ? setMode('day') : setMode('agenda')
  }

  const onLimitReached = (direction) => {
    let startDate;
    if (direction > 0) {
      startDate = moment(events[events.length - 1].date);
      startDate.add(1, 'days');
    } else {
      setFetching(true);
      startDate = moment(events[0].date);
      startDate.subtract(5, 'days');
    }
    const newEvents = generateEvents(startDate.format('YYYY-MM-DD'), 5);
    setTimeout(() => {
      setEvents(direction > 0 ? events.concat(newEvents) : newEvents.concat(events));
      setFetching(false);
    }, 500);

  }

  const renderSectionHeader = ({section}) => {
    return (
      <DaySectionHeader date={section.date} />
    )
  }
 
  const renderItem = ({ item }) => (
    <AgendaEvent event={item} onEventPress={onEventTapped} />
  );

  const renderEventDay = ({ event, style }) => {
    return (
      <EventComponent key={event.id} calendar event={event} onPress={onEventTapped} style={style} />
    )
  };

  const renderDayFooter = () => (
    <View style={{ height: 1, backgroundColor: '#D0D0D0' }} />
  )

  const agendaKeyExtractor = (item, index) => index;

  const onMinutesPerBlockChange = () => {
    setLoading(true);
    setTimeout(() => {
      setMinutesPerBlock(Number.parseInt(minutes, 10));
      setLoading(false);
    }, 100);
  }

  const onLongPressOut = ({ start, end }) => {
    Alert.alert(
      "New event",
      `Start: ${start} - End: ${end}`,
      [
        { text: "OK" }
      ],
      { cancelable: false }
    );
  }

  const renderPressEvent = () => <EmptyEvent />;

  const renderCalendars = () => {
    if (loading) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={'cyan'} />
        </View>
      );
    }

    switch (mode) {
      case 'day':
        return (
          <EventCalendar
            events={events}
            width={width}
            onEventTapped={onEventTapped}
            renderEvent={renderEventDay}
            onDateChange={setDate}
            startKey="start"
            endKey="end"
            orderEvents={false}
            initDate={date}
            ref={calendarRef}
            minutesPerBlock={minutesPerBlock}
          />
        );

      case 'agenda':
        return (
          <AgendaViewSection
            events={events}
            width={width}
            onEventPress={onEventTapped}
            ref={agendaRef}
            onDateChange={onDateChange}
            initialDate={date}
            onLimitReached={onLimitReached}
            renderEvent={renderItem}
            itemHeight={78}
            loading={fetching}
            sectionHeaderHeight={40}
            renderSectionHeader={renderSectionHeader}
            renderDayFooter={renderDayFooter}
            keyExtractor={agendaKeyExtractor}
            renderPressEvent={renderPressEvent}
            onLongPressOut={onLongPressOut}
          />
        )
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <Text style={{textAlign: 'center'}}>{date}</Text>
      <View style={{}}>
        <TextInput value={goToDate} onChangeText={setGoToDate} style={{borderBottomColor: 'grey', borderBottomWidth: 1, marginBottom: 8, }} />
        <Button title="Go to Date" onPress={goToDateHandler} />
        <TextInput value={minutes} onChangeText={setMinutes} style={{borderBottomColor: 'grey', borderBottomWidth: 1, marginBottom: 8, }} />
        <Button title="Change Minutes per block" onPress={onMinutesPerBlockChange} />
        <Button title="Change Calendar Mode" onPress={toggleMode} />
      </View>
      { renderCalendars() }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  event: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    height: 70,
    width: '100%',
  },
  eventText: {
    color: 'white',
  }
});

export default App;


