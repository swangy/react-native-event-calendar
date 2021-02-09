import React, { useRef, useState } from 'react';
import { Button, Dimensions, SafeAreaView, Text, TextInput, useWindowDimensions, View, StyleSheet } from 'react-native';
import moment from 'moment';
import { EventCalendar, AgendaView } from './src';
import { DAY_IN_MILISECONDS } from './src/constants';
import AgendaViewSection from './src/AgendaViewSection';

import { dateToString, newDate } from './src/utils';
import DaySectionHeader from './src/DaySectionHeader';
import AgendaEvent from './src/AgendaEvent';
import EventComponent from './src/EventComponent';

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
      data: day === days - 1 ? generateEmptyEvent() : generateEventsByDate(currentDate),
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

const generateEmptyEvent = () => ([{
  booking_type: 'empty',
}])
 

const App = () =>  {
  
  const [events, setEvents] = useState(generateEvents('2021-01-09', 5));
  const [date, setDate] = useState('2021-01-11');
  const [goToDate, setGoToDate] = useState('')
  const [mode, setMode] = useState('agenda');
  const [fetching, setFetching] = useState(false);

  const calendarRef = useRef(null);
  const agendaRef = useRef(null);

  const width = Dimensions.get('window').width;


  const goToDateHandler = () => {
    if (mode === 'agenda') {
      agendaRef.current.goToDate(goToDate);
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
  

  return (
    <SafeAreaView style={{flex: 1}}>
      <Text style={{textAlign: 'center'}}>{date}</Text>
      <View style={{}}>
        <TextInput value={goToDate} onChangeText={setGoToDate}/>
        <Button title="Go to Date" onPress={goToDateHandler} />
        <Button title="Change Calendar Mode" onPress={toggleMode} />
      </View>

      { 
        mode === 'day'
        ? (
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
          />
          ) : (
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
              sectionHeaderHeight={36}
              renderSectionHeader={renderSectionHeader}
              renderDayFooter={renderDayFooter}
            />
          )
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  event: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    height: 70,
  },
  eventText: {
    color: 'white',
  }
});

export default App;


