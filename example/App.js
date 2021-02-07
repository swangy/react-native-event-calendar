import React, { useRef, useState } from 'react';
import { Button, Dimensions, SafeAreaView, Text, TextInput, useWindowDimensions, View, StyleSheet } from 'react-native';
import moment from 'moment';
import { EventCalendar, AgendaView } from './src';
import { DAY_IN_MILISECONDS } from './src/constants';
import AgendaViewSection from './src/AgendaViewSection';

import { dateToString, newDate } from './src/utils';

function addZero(number) {
  return number >= 10 ? number : `0${number}`;
}

// function generateDate(date, hour, min) {
//   return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}T${addZero(hour)}:${addZero(min)}:00`;
// }

function generateDate(date, hour, min) {
  return `${date} ${addZero(hour)}:${addZero(min)}:00`;
}

function generateDateKey(date) {
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}`
}

const generateTime = (date) => (
  `${addZero(date.getHours(date))}:${addZero(date.getMinutes())}`
)


function generateEvents(startDate, days) {
  const events = [];
  const currentDate = moment(startDate);
  for (let day = 0; day < days; day++) {
    events.push({
      data: generateEventsByDate(currentDate),
      date: currentDate.format('YYYY-MM-DD'),
    })
    currentDate.add(1, 'day');
  }

  return events;
}

function generateEventsHash(days) {
  const events = {};
  const currentDate = new Date('2021-01-11T00:00:00');
  for (let day = 0; day < days; day++) {
    events[generateDateKey(currentDate)] = generateEventsByDate(currentDate)
    currentDate.setTime(currentDate.getTime() + DAY_IN_MILISECONDS)
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

const App = () =>  {
  
  // const [events, setEvents] = useState(generateEvents(5))
  const [events, setEvents] = useState(generateEvents('2021-01-09', 5))
  const [date, setDate] = useState('2021-01-11');
  const [goToDate, setGoToDate] = useState('')
  const [mode, setMode] = useState('agenda');
  const [fetching, setFetching] = useState(false);

  const calendarRef = useRef(null);
  const agendaRef = useRef(null);

  const width = Dimensions.get('window').width;

  const renderEvent = (event) => {

    const startDate = new Date(event.start)
    const endDate = new Date(event.end)

    return (
      <View style={styles.event}>
        <Text style={styles.eventText}>Rodrigo Monsalve</Text>
        <Text style={styles.eventText}>{`${generateTime(startDate)}-${generateTime(endDate)}`}</Text>
        <Text style={styles.eventText}>Rodrigo Monsalve</Text>
      </View>
    );
  }

  const renderEventDay = (event) => {

    const startDate = new Date(event.start)
    const endDate = new Date(event.end)

    return (
      <View>
        <Text style={styles.eventText}>Rodrigo Monsalve</Text>
        <Text style={styles.eventText}>{`${generateTime(startDate)}-${generateTime(endDate)}`}</Text>
        <Text style={styles.eventText}>Rodrigo Monsalve</Text>
      </View>
    );
  }

  const addEventStart = () => {
    const addDate = newDate(goToDate);
    const event = {
      data: generateEventsByDate(addDate),
      date: generateDateKey(addDate)
    }
    const newEvents = events.slice()
    newEvents.unshift(event)
    setEvents(newEvents)
  }

  // const onDateChange = (date) => {
  //   this.setState({date})
  // };

  // onChangeText(date) {
  //   this.setState({goToDate: date})
  // }

  const onPressHandler = () => {
    calendarRef.current.goToDate(goToDate);
  }

  const onEventTapped = (event) => {console.log("omg omg ogm")};

  const moveEvent = () => {
    agendaRef.current.scrollToIndex(goToDate);
  }

  const onDateChange = (newDate) => {
    setDate(newDate)
  }

  const toggleMode = () => {
    mode === 'agenda' ? setMode('day') : setMode('agenda')
  }
  

  const renderSectionHeader = ({section}) => {
    return (
      <View style={{backgroundColor: 'white', height: 30}}>
        <Text>{section.date}</Text>
      </View>
    )
  }

  const onLimitReached = (direction) => {
    console.log("limit reached")
    console.log("fetchgin", fetching);
    console.log("direction", direction);
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
  
  

  return (
    <SafeAreaView style={{flex: 1}}>
      <Text style={{textAlign: 'center'}}>{date}</Text>
      <View style={{}}>
        <TextInput value={goToDate} onChangeText={setGoToDate}/>
        <Button style={{backgroundColor: 'green', heigth: 200}} title="Ir omg is this real " onPress={onPressHandler} />
        <Button title="Add" onPress={addEventStart} />
        <Button title="Move event" onPress={moveEvent} />
        <Button title="Change Mode" onPress={toggleMode} />
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
              itemHeight={70}
              loading={fetching}
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


