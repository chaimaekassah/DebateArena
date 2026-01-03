import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Dashboard from '../screens/UserInformation/Dashboard';
import Profile from '../screens/UserInformation/Profil';
import StartDebate from '../screens/Debate/StartDebate';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Pas de header en haut
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home';
          if (route.name === 'Profile') iconName = 'person';
          if (route.name === 'StartDebate') iconName = 'play-circle';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="StartDebate" component={StartDebate} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
