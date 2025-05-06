import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/theme';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PhoneLoginScreen from '../screens/PhoneLoginScreen';
import HomeScreen from '../screens/HomeScreen';
import UrlScanScreen from '../screens/UrlScanScreen';
import FileScanScreen from '../screens/FileScanScreen';
import ImageScanScreen from '../screens/ImageScanScreen';
import ScanHistoryScreen from '../screens/ScanHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Define types for navigation
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  PhoneLogin: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  ScanHistory: undefined;
  Profile: undefined;
};

export type ScanStackParamList = {
  Home: undefined;
  UrlScan: undefined;
  FileScan: undefined;
  ImageScan: undefined;
  ScanResult: { scanId: number };
};

// Create navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const ScanStack = createNativeStackNavigator<ScanStackParamList>();

// Auth navigator
const AuthNavigator = () => (
  <AuthStack.Navigator 
    screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
  </AuthStack.Navigator>
);

// Scan stack navigator (for home tab)
const ScanNavigator = () => (
  <ScanStack.Navigator>
    <ScanStack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ headerShown: false }}
    />
    <ScanStack.Screen 
      name="UrlScan" 
      component={UrlScanScreen} 
      options={{ title: 'URL Scan' }}
    />
    <ScanStack.Screen 
      name="FileScan" 
      component={FileScanScreen} 
      options={{ title: 'File Scan' }}
    />
    <ScanStack.Screen 
      name="ImageScan" 
      component={ImageScanScreen} 
      options={{ title: 'Image Scan' }}
    />
  </ScanStack.Navigator>
);

// Main tab navigator
const MainNavigator = () => (
  <MainTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let icon;

        if (route.name === 'Home') {
          icon = focused 
            ? <MaterialCommunityIcons name="shield-check" size={size} color={color} />
            : <MaterialCommunityIcons name="shield-outline" size={size} color={color} />;
        } else if (route.name === 'ScanHistory') {
          icon = focused 
            ? <MaterialCommunityIcons name="history" size={size} color={color} />
            : <MaterialCommunityIcons name="history" size={size} color={color} />;
        } else if (route.name === 'Profile') {
          icon = focused 
            ? <Ionicons name="person" size={size} color={color} />
            : <Ionicons name="person-outline" size={size} color={color} />;
        }

        return icon;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textLight,
      headerShown: route.name !== 'Home',
    })}
  >
    <MainTab.Screen 
      name="Home" 
      component={ScanNavigator} 
      options={{ headerShown: false }}
    />
    <MainTab.Screen 
      name="ScanHistory" 
      component={ScanHistoryScreen} 
      options={{ title: 'Scan History' }}
    />
    <MainTab.Screen 
      name="Profile" 
      component={ProfileScreen} 
    />
  </MainTab.Navigator>
);

// Root navigator that handles auth state
const Navigation = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You might want to show a loading screen here
    return null;
  }

  return user ? <MainNavigator /> : <AuthNavigator />;
};

export default Navigation;