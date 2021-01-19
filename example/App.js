import React, { useRef, useState } from 'react';
import { Button, Dimensions, SafeAreaView, Text, TextInput, useWindowDimensions, View } from 'react-native';

import EventCalendar from './src/EventCalendar';

let { width } = Dimensions.get('window');

function addZero(number) {
  return number >= 10 ? number : `0${number}`;
}

function generateDate(date, hour, min) {
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}T${addZero(hour)}:${addZero(min)}:00`;
}

function generateDateKey(date) {
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}`
}


function generateEvents(days) {
  const events = [];
  const currentDate = new Date('2021-01-11T00:00:00');
  for (let day = 0; day < days; day++) {
    events.push({
      events: generateEventsByDate(currentDate),
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
  for (let hour = 0; hour < 22; hour++) {
      
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
     
  }

  return dayEvents;
}

const App = () =>  {
 
  const [events, setEvents] = useState(generateEvents(10))
  const [date, setDate] = useState('2021-01-11')
  const [goToDate, setGoToDate] = useState('')

  const calendarRef = useRef(null)

  const window = useWindowDimensions()


  const renderEvent = (event) => {
    return (
      <View>
        <Text>{event.start}</Text>
      </View>
    );
  }

  const addEventStart = () => {
    const addDate = new Date(`${goToDate}T00:00:00`)
    const event = {
      events: generateEventsByDate(addDate),
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

  const onEventTapped = () => {};

  return (
    <SafeAreaView style={{flex: 1}}>
      <Text style={{textAlign: 'center'}}>{date}</Text>
      <View style={{}}>
        <TextInput value={goToDate} onChangeText={setGoToDate}/>
        <Button title="Ir" onPress={onPressHandler} />
        <Button title="Add" onPress={addEventStart} />
      </View>
      <EventCalendar
        events={events}
        width={window.width}
        onEventTapped={onEventTapped}
        renderEvent={renderEvent}
        onDateChange={setDate}
        startKey="start"
        endKey="end"
        orderEvents={false}
        initDate={date}
        ref={calendarRef}

      />
    </SafeAreaView>
  );
}

export default App;


