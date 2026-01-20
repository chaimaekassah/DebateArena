import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './../screens/Auth/Login';
import SignUp from './../screens/Auth/signup';
import AppTabs from './AppTabs';
import Categories from './../screens/Debate/Categories';
import Subject from '../screens/Debate/Subject';
import StartDebate from '../screens/Debate/StartDebate';
import Chat from '../screens/Debate/Chat';
import Dashboard from '../screens/UserInformation/Dashboard';
import DebateResult from '../screens/Debate/DebateResult';
import ForgotPassword from '../screens/Auth/ForgotPassword';

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
        
        {/* Écrans d'authentification */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        

        {/* Navigation principale avec onglets */}
        <Stack.Screen name="AppTabs" component={AppTabs} />

        <Stack.Screen name="Categories" component={Categories} />
        <Stack.Screen name="Subject" component={Subject} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="StartDebate" component={StartDebate} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="DebateResult" component={DebateResult} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;