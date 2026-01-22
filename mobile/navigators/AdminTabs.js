// navigators/AdminTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import AdminDashboard from '../screens/Admin/AdminDashboard';
import AdminProfile from '../screens/Admin/AdminProfile';
import AdminSignal from '../screens/Admin/AdminSignal';
import AdminSubject from '../screens/Admin/AdminSubject';

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Signalements') {
            iconName = focused ? 'warning' : 'warning-outline';
          } else if (route.name === 'Sujets') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
       
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#FFC482', // Jaune
        tabBarInactiveTintColor: '#6DB1BF', // Bleu
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 2,
        },
        
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // Fond blanc
          borderTopWidth: 2,
          borderTopColor: '#FFC482', // Bordure jaune
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
          // Pour Android
          elevation: 8,
          // Pour iOS
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        // En-tête avec style admin
        headerShown: true,
        headerStyle: {
          backgroundColor: '#6DB1BF', // Bleu
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerTintColor: '#FFFFFF', // Texte blanc
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboard}
        options={{
          tabBarLabel: 'Dashboard',
          headerTitle: 'Dashboard Administrateur',
        }}
      />
      <Tab.Screen 
        name="Signalements" 
        component={AdminSignal}
        options={{
          tabBarLabel: 'Signalements',
          headerTitle: 'Gestion des Signalements',
        }}
      />
      <Tab.Screen 
        name="Sujets" 
        component={AdminSubject}
        options={{
          tabBarLabel: 'Sujets',
          headerTitle: 'Gestion des Sujets',
        }}
      />
      <Tab.Screen 
        name="Profil" 
        component={AdminProfile}
        options={{
          tabBarLabel: 'Admin',
          headerTitle: 'Profil Administrateur',
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;