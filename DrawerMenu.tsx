// Copyright (c) Microsoft.
// Licensed under the MIT license.

import React, {FC} from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
  ImageSourcePropType,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {StackScreenProps} from '@react-navigation/stack';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

import {AuthContext} from '../AuthContext';
import {UserContext} from '../UserContext';
import {StackParamList} from '../App';
import {GraphManager} from '../graph/GraphManager';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import NewEventScreen from '../screens/NewEventScreen';
import TestScreen from '../screens/TestScreen';
import AddEntryScreen from '../screens/AddEntryScreen';

const Drawer = createDrawerNavigator();

type CustomDrawerContentProps = DrawerContentComponentProps & {
  userName: string;
  userEmail: string;
  userPhoto: ImageSourcePropType;
  signOut: () => void;
};

type DrawerMenuProps = StackScreenProps<StackParamList, 'Main'>;

const CustomDrawerContent: FC<CustomDrawerContentProps> = props => {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.profileView}>
        <Image
          source={props.userPhoto}
          resizeMode='contain'
          style={styles.profilePhoto}
        />
        <Text style={styles.profileUserName}>{props.userName}</Text>
        <Text style={styles.profileEmail}>{props.userEmail}</Text>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem label='Sign Out' onPress={props.signOut} />
    </DrawerContentScrollView>
  );
};

export default class DrawerMenuContent extends React.Component<DrawerMenuProps> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  state = {
    // TEMPORARY
    userLoading: true,
    userFirstName: 'Adele',
    userFullName: 'Adele Vance',
    userEmail: 'adelev@contoso.com',
    userTimeZone: 'UTC',
    userPhoto: require('../images/no-profile-pic.png'),
  };

  _signOut = async () => {
    this.context.signOut();
  };

  async componentDidMount() {
    this.props.navigation.setOptions({
      headerShown: false,
      animationEnabled: false,
    });

    try {
      // Get the signed-in user from Graph
      const user: MicrosoftGraph.User = await GraphManager.getUserAsync();

      // Update UI with display name and email
      this.setState({
        userLoading: false,
        userFirstName: user.givenName!,
        userFullName: user.displayName!,
        // Work/School accounts have email address in mail attribute
        // Personal accounts have it in userPrincipalName
        userEmail: user.mail! || user.userPrincipalName!,
        userTimeZone: user.mailboxSettings?.timeZone!,
      });
    } catch (error) {
      Alert.alert(
        'Error getting user',
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
    const userLoaded = !this.state.userLoading;

    return (
      <UserContext.Provider value={this.state}>
        <Drawer.Navigator
          initialRouteName='Home'
          screenOptions={{
            drawerType: 'front',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#276b80',
            },
            headerTintColor: 'white',
          }}
          // eslint-disable-next-line react/no-unstable-nested-components
          drawerContent={props => (
            <CustomDrawerContent
              {...props}
              userName={this.state.userFullName}
              userEmail={this.state.userEmail}
              userPhoto={this.state.userPhoto}
              signOut={this._signOut}
            />
          )}>
          <Drawer.Screen
            name='Home'
            component={HomeScreen}
            options={{drawerLabel: 'Home', headerTitle: 'Welcome'}}
          />
          {userLoaded && (
            <Drawer.Screen
              name='Calendar'
              component={CalendarScreen}
              options={{drawerLabel: 'Calendar'}}
            />
          )}
          {userLoaded && (
            <Drawer.Screen
              name='NewEvent'
              component={NewEventScreen}
              options={{drawerLabel: 'New event'}}
            />
          )}
          {userLoaded && (
            <Drawer.Screen
              name='Test'
              component={TestScreen}
              options={{drawerLabel: 'Test'}}
            />
          )}
          {userLoaded && (
            <Drawer.Screen
              name='AddEntry'
              component={AddEntryScreen}
              options={{drawerLabel: 'Add Entry'}}
            />
          )}
        </Drawer.Navigator>
      </UserContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileView: {
    alignItems: 'center',
    padding: 10,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileUserName: {
    fontWeight: '700',
  },
  profileEmail: {
    fontWeight: '200',
    fontSize: 10,
  },
});
