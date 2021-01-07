import React from 'react';
import { Button, Dimensions, Text, TextInput, View } from 'react-native';

import EventCalendar from './src/EventCalendar';

let { width } = Dimensions.get('window');

function addZero(number) {
  return number >= 10 ? number : `0${number}`;
}

function generateDate(date, hour, min) {
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())} ${addZero(hour)}:${addZero(min)}:00`;
}

function generateDateKey(date) {
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}`
}


function generateEvents(days) {
  const events = {};
  const currentDate = new Date('2017-09-06');
  for (let day = 0; day < days; day++) {
    dayEvents = []
     for (let hour = 0; hour < 22; hour++) {
      
      dayEvents.push({
        start: generateDate(currentDate, hour, 0),
        end: generateDate(currentDate, hour +1, 0),
      })

      dayEvents.push({
        start: generateDate(currentDate, hour, 0),
        end: generateDate(currentDate, hour, 30),
      })

      dayEvents.push({
        start: generateDate(currentDate, hour, 30),
        end: generateDate(currentDate, hour + 1, 0),
      })
       
    }

    events[generateDateKey(currentDate)] = dayEvents;
    currentDate.setTime(currentDate.getTime() + (24*60*60*1000))
  }

  return events;
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: generateEvents(10),
      date: '2017-09-07',
      goToDate: '',
    };

    this.calendarRef = React.createRef();


    this.onDateChange = this.onDateChange.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.goToDate = this.goToDate.bind(this);
  }

  _eventTapped(event) {
    alert(JSON.stringify(event));
  }

  renderEvent(event) {
    return (
      <View>
        <Text>{event.start}</Text>
      </View>
    );
  }

  onDateChange(date) {
    this.setState({date})
  };

  onChangeText(date) {
    this.setState({goToDate: date})
  }

  goToDate() {
    this.calendarRef.current.goToDate(this.state.goToDate);
  }

  render() {
    return (
      <View style={{ flex: 1, marginTop: 40 }}>
        <Text style={{textAlign: 'center'}}>{this.state.date}</Text>
        <View style={{}}>
          <TextInput value={this.state.goToDate} onChangeText={this.onChangeText}/>
          <Button title="Ir" onPress={this.goToDate}/>
        </View>
        <EventCalendar
          mode="daily"
          eventTapped={this._eventTapped.bind(this)}
          events={this.state.events}
          width={width}
          initDate={'2017-09-07'}
          scrollToFirst
          upperCaseHeader
          uppercase
          scrollToFirst={false}
          renderEvent={this.renderEvent}
          startKey="start"
          endKey='end'
          onDateChange={this.onDateChange}
          ref={this.calendarRef}
        />
      </View>
    );
  }
}


