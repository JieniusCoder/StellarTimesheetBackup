// Copyright (c) Microsoft.
// Licensed under the MIT license.

import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import {endOfWeek, format, parseISO, startOfWeek} from 'date-fns';
import {zonedTimeToUtc} from 'date-fns-tz';
import {findIana} from 'windows-iana';

import {UserContext} from '../UserContext';
import {GraphManager} from '../graph/GraphManager';

const Stack = createStackNavigator();
const TestState = React.createContext<TestScreenState>({
  loadingEvents: true,
  events: [],
});

type TestScreenState = {
  loadingEvents: boolean;
  events: MicrosoftGraph.Event[];
};

// Temporary JSON view
const TestComponent = () => {
  const testState = React.useContext(TestState);

  return (
    <View style={styles.container}>
    </View>
  );
};


export default class TestScreen extends React.Component {
  static contextType = UserContext;
  declare context: React.ContextType<typeof UserContext>;

  state: TestScreenState = {
    loadingEvents: true,
    events: [],
  };


 async componentDidMount() {
    try {
        const listId = "7ffbbbbd-9257-4485-b8f5-9755e79a762d"
        const sharepointList = await GraphManager.getListDetails(listId);
        console.log(sharepointList);
        Alert.alert(
            'List details: ',
            JSON.stringify(sharepointList)
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
      <TestState.Provider value={this.state}>
        <Stack.Navigator>
          <Stack.Screen
            name='TestScreen'
            component={TestComponent}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </TestState.Provider>
    );
  }
}

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
});
