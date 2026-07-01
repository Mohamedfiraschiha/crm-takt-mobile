import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ClientsListScreen from "../screens/clients/ClientsListScreen";
import ClientDetailScreen from "../screens/clients/ClientDetailScreen";
import ClientFormScreen from "../screens/clients/ClientFormScreen";

const Stack = createNativeStackNavigator();

export default function ClientsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientsList" component={ClientsListScreen} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
      <Stack.Screen name="ClientForm" component={ClientFormScreen} />
    </Stack.Navigator>
  );
}
