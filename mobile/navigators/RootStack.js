import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './../screens/Auth/Login';
import Dashboard from '../screens/UserInformation/Dashboard';
import SignUp from './../screens/Auth/signup';
import NewDebate from '../screens/Debate/NewDebate';
import Categories from '../screens/Debate/Categories';
import AppTabs from './AppTabs';



const Stack = createNativeStackNavigator();

const RootStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName='Login'
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />

         {/* App après login */}
        <Stack.Screen name="AppTabs" component={AppTabs} />

        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="NewDebate" component={NewDebate} />
        <Stack.Screen name="Categories" component={Categories} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;
