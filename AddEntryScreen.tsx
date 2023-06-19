// Copyright (c) Microsoft.
// Licensed under the MIT license.

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  View,
  StyleSheet, 
  TextInput, 
  Button, 
  SafeAreaView, 
  ScrollView, 
  Text, Image
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import {endOfWeek, format, parseISO, startOfWeek} from 'date-fns';
import {zonedTimeToUtc} from 'date-fns-tz';
import {findIana} from 'windows-iana';

import {UserContext} from '../UserContext';
import {GraphManager} from '../graph/GraphManager';

//declare timesheet data field entries
interface Entry {
  class: string;
  project: string;
  days: string[];
  accomplishments: string;
}

//declare timesheet entry props
interface TimesheetEntryProps {
  entry: Entry;
  onChangeClass: (value: string) => void;
  onChangeDay: (dayIndex: number, value: string) => void;
  onChangeProject: (value: string) => void;
  onChangeAccomplishments: (value: string) => void;
}

//declare entry state
const Stack = createStackNavigator();
const AddEntryState = React.createContext<AddEntryScreenState>({
  loadingEvents: true,
  events: [],
});

type AddEntryScreenState = {
  loadingEvents: boolean;
  events: MicrosoftGraph.Event[];
};

// Temporary JSON view
const AddEntryComponent = () => {
  const testState = React.useContext(AddEntryState);

  return (
    <View style={styles.container}>
    </View>
  );
};

//declare AddEntryScreen
const TimesheetEntry: React.FC<TimesheetEntryProps> = ({ entry, onChangeClass, onChangeProject, onChangeDay, onChangeAccomplishments }) => {
  const handleClassChange = (text:string) => {
    onChangeClass(text);
  };

  const handleProjectChange = (text:string) => {
    onChangeProject(text);
  };

  const handleDayChange = (index:number, text:string) => {
    onChangeDay(index, text);
  };

  const handleAccomplishmentsChange = (text:string) => {
    onChangeAccomplishments(text);
  };

  const getTotalHours = () => {
    return entry.days.reduce((acc, day) => acc + Number(day), 0);
  };

  return (
    <View style={styles.entryContainer}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Class"
          value={entry.class}
          onChangeText={handleClassChange}
        />
        <TextInput
          style={styles.input}
          placeholder="Project"
          value={entry.project}
          onChangeText={handleProjectChange}
        />
      </View>
      <View style={styles.dayRow}>
        <Text style={styles.dayHeader}>Mon</Text>
        <Text style={styles.dayHeader}>Tue</Text>
        <Text style={styles.dayHeader}>Wed</Text>
        <Text style={styles.dayHeader}>Thu</Text>
        <Text style={styles.dayHeader}>Fri</Text>
      </View>
      <View style={styles.dayRow}>
        {entry.days.map((day, index) => (
          <TextInput
            key={index}
            style={styles.dayInput}
            placeholder="Hours"
            value={day}
            onChangeText={(text) => handleDayChange(index, text)}
          />
        ))}
      </View>
      <TextInput
        style={styles.accomplishmentsInput}
        placeholder="Accomplishments"
        value={entry.accomplishments}
        onChangeText={handleAccomplishmentsChange}
        multiline
      />
      <View style={styles.totalHoursContainer}>
        <Text style={styles.totalHoursText}>
          Total Hours: {getTotalHours()}
        </Text>
      </View>
      {getTotalHours() > 40 && (
        <Text style={styles.errorText}>
          Total hours per row should not exceed 40.
        </Text>
      )}
    </View>
  );
};

const Timesheet = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const addEntry = () => {
    const newEntry = {
      class: '',
      project: '',
      days: ['', '', '', '', ''],
      accomplishments: '',
    };
    setEntries([...entries, newEntry]);
  };

  const updateDay = (entryIndex:number, dayIndex:number, value:string) => {
    const updatedEntries = [...entries];
    updatedEntries[entryIndex].days[dayIndex] = value;
    setEntries(updatedEntries);
  };

  const updateClass = (index: number, value: string) => {
    const updatedEntries = [...entries];
    updatedEntries[index].class = value;
    setEntries(updatedEntries);
  };

  const updateProject = (index: number, value: string) => {
    const updatedEntries = [...entries];
    updatedEntries[index].project = value;
    setEntries(updatedEntries);
  };

  const updateAccomplishments = (index: number, value: string) => {
    const updatedEntries = [...entries];
    updatedEntries[index].accomplishments = value;
    setEntries(updatedEntries);
  };

  const renderEntries = () => {
    return entries.map((entry, index) => (
      <TimesheetEntry
      key={index}
      entry={entry}
      onChangeClass={(value) => updateClass(index, value)}
      onChangeProject={(value) => updateProject(index, value)}
      onChangeDay ={(dayIndex, value) => updateDay(index, dayIndex, value)}
      onChangeAccomplishments={(value) => updateAccomplishments(index, value)}
      />
    ));
  };

  return (
    <View style={styles.timesheetContainer}>
      <View style={styles.headerContainer}>
        <Image style={styles.logo} source={require('../assets/logo.png')} />
      </View>
      <View style={styles.buttonRow}>
        <Button title="Previous Week" onPress={() => {}} color="#800000" />
        <Button title="Next Week" onPress={() => {}} color="#800000" />
        <Button title="Copy Previous Week" onPress={() => {}} color="#800000" />
      </View>
      <View style={styles.addEntryContainer}>
        <Button title="Add Entry" onPress={addEntry} color="#800000" />
      </View>
      <ScrollView contentContainerStyle={styles.entriesContainer}>
        {renderEntries()}
      </ScrollView>
      <View style={styles.buttonRow}>
        <View style={styles.buttonWrapper}>
          <Button title="Save" onPress={() => {}} color="#800000" />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Submit" onPress={() => {}} color="#800000" />
        </View>
      </View>
    </View>
  );
};

//Main screen
export default class TestScreen extends React.Component {
  static contextType = UserContext;
  declare context: React.ContextType<typeof UserContext>;

  state: AddEntryScreenState = {
    loadingEvents: true,
    events: [],
  };


 async componentDidMount() {
    try {
        const newEntry = {"fields": {
            "_x0044_ay1": "8",
            "EndDate": "06/20/2023"
        }}
        const addSharePointList = await GraphManager.createEntryTimeSheet(newEntry);
        console.log(addSharePointList);
        Alert.alert(
            'List success: ',
            JSON.stringify(addSharePointList)
        )
    } catch (error) {
      Alert.alert(
        'Error retrieving SharePoint list:',
        JSON.stringify(error),
        [
          {
            text: 'OK',
          },
        ],
        {cancelable: false},
      );
    }
  }

  render() {
    return (
      <AddEntryState.Provider value={this.state}>
        {/* <Stack.Navigator>
          <Stack.Screen
            name='TestScreen'
            component={AddEntryComponent}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator> */}
        <Timesheet />
      </AddEntryState.Provider>
      
    );
  }
}

//Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventItem: {
    padding: 10,
  },
  eventSubject: {
    fontWeight: '700',
    fontSize: 18,
  },
  eventOrganizer: {
    fontWeight: '200',
  },
  eventDuration: {
    fontWeight: '200',
  },
  timesheetContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  addEntryContainer: {
    marginBottom: 10,
  },
  entriesContainer: {
    paddingBottom: 20,
  },
  entryContainer: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  dayRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dayInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 5,
    textAlign: 'center',
  },
  accomplishmentsInput: {
    height: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    textAlignVertical: 'top',
  },
  totalHoursContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  totalHoursText: {
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});
