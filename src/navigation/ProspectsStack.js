import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProspectsListScreen from "../screens/prospects/ProspectsListScreen";
import ProspectDetailScreen from "../screens/prospects/ProspectDetailScreen";
import ProspectFormScreen from "../screens/prospects/ProspectFormScreen";
import ProspectsKanbanScreen from "../screens/prospects/ProspectsKanbanScreen";

const Stack = createNativeStackNavigator();

export default function ProspectsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProspectsList" component={ProspectsListScreen} />
      <Stack.Screen name="ProspectDetail" component={ProspectDetailScreen} />
      <Stack.Screen name="ProspectForm" component={ProspectFormScreen} />
      <Stack.Screen name="ProspectsKanban" component={ProspectsKanbanScreen} />
    </Stack.Navigator>
  );
}
