import React, { useRef, useState } from 'react';
import { Button, Dimensions, SafeAreaView, Text, TextInput, useWindowDimensions, View, StyleSheet } from 'react-native';
import { EventCalendar, AgendaView } from './src';

import { newDate } from './src/utils';

function addZero(number) {
  return number >= 10 ? number : `0${number}`;
}

function generateDate(date, hour, min) {
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}T${addZero(hour)}:${addZero(min)}:00`;
}

function generateDateKey(date) {
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}`
}

const generateTime = (date) => (
  `${addZero(date.getHours(date))}:${addZero(date.getMinutes())}`
)


function generateEvents(days) {
  const events = [];
  const currentDate = new Date('2021-01-11T00:00:00');
  for (let day = 0; day < days; day++) {
    events.push({
      data: generateEventsByDate(currentDate),
      date: generateDateKey(currentDate)
    })
    currentDate.setTime(currentDate.getTime() + (24*60*60*1000))
  }

  return events;
}

function generateEventsHash(days) {
  const events = {};
  const currentDate = new Date('2021-01-11T00:00:00');
  for (let day = 0; day < days; day++) {
    events[generateDateKey(currentDate)] = generateEventsByDate(currentDate)
    currentDate.setTime(currentDate.getTime() + (24*60*60*1000))
  }

  return events;
}

const generateEventsByDate = (date) => {

  let id = 1;

  const dayEvents = []
  for (let hour = 0; hour < 2; hour++) {
      
    dayEvents.push({
      start: generateDate(date, hour, 0),
      end: generateDate(date, hour +1, 0),
      booking_type: 'blocked',
      id
    })
    
    id+=1

    dayEvents.push({
      start: generateDate(date, hour, 0),
      end: generateDate(date, hour, 30),
      id
    })

    id+=1

    dayEvents.push({
      start: generateDate(date, hour, 30),
      end: generateDate(date, hour + 1, 0),
      id
    })

    id+=1
     
  }

  return dayEvents;
}

const App = () =>  {
 
  const [events, setEvents] = useState(generateEvents(5))
  const [date, setDate] = useState('2021-01-11')
  const [goToDate, setGoToDate] = useState('')
  const [mode, setMode] = useState('agenda');

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
    agendaRef.current.moveScrollView();
  }

  const onDateChange = (newDate) => {
    setDate(newDate)
  }

  const toggleMode = () => {
    mode === 'agenda' ? setMode('day') : setMode('agenda')
  }
  

  const renderSectionHeader = ({section}) => {
    return (
      <View style={{backgroundColor: 'white'}}>
        <Text>{section.date}</Text>
      </View>
    )
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
            <AgendaView
              events={events}
              renderEvent={renderEvent}
              width={width}
              render
              onEventPress={onEventTapped}
              renderSectionHeader={renderSectionHeader}
              ref={agendaRef}
              onDateChange={onDateChange}
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
  },
  eventText: {
    color: 'white',
  }
});

export default App;


