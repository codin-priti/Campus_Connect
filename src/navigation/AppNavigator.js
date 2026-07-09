import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/Welcome";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/Register";
import HomeScreen from "../screens/HomeScreen";
import ReportFoundScreen from "../screens/PostScreen";
import ReportLostScreen from "../screens/LostScreen";
import LostReportsScreen from "../screens/lostHistory";
import PostHistoryScreen from "../screens/postHistory";
import MatchResultsScreen from "../screens/matchScreen";
import ChatScreen from "../screens/chatScreen";
import RecentChatsScreen from "../screens/Recentchats";
import SearchResultsScreen from "../screens/SearchScreen";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";



const Stack = createNativeStackNavigator();



export default function AppNavigator() {
  const navigationRef = useRef();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
  useEffect(() => {
  const subscription =
    Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data =
          response.notification.request.content
            .data;

        if (data.chatId) {
          navigationRef.current?.navigate(
            "Chat",
            {
              chatId: data.chatId,
            }
          );
        }
      }
    );

  return () => subscription.remove();
}, []);
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Welcome">
        
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
                    options={{ headerShown: false }}

        />
        <Stack.Screen
          name="ReportFound"
          component={ReportFoundScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReportLost"
          component={ReportLostScreen}
          options={{ headerShown: false }}
        />
       <Stack.Screen
          name="LostReports"
          component={LostReportsScreen}
                    options={{ headerShown: false }}

        />

       <Stack.Screen
          name="PostHistory"
          component={PostHistoryScreen}
                    options={{ headerShown: false }}
        />
       <Stack.Screen
          name="MatchScreen"
          component={MatchResultsScreen}
                    options={{ headerShown: false }}
        />
       <Stack.Screen
          name="Chat"
          component={ChatScreen}
                    options={{ headerShown: false }}
        />

        <Stack.Screen
          name="RecentChats"
          component={RecentChatsScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="SearchResults"
          component={SearchResultsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
      