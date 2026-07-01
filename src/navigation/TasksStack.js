import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TasksListScreen from "../screens/tasks/TasksListScreen";
import TaskDetailScreen from "../screens/tasks/TaskDetailScreen";
import TaskFormScreen from "../screens/tasks/TaskFormScreen";

const Stack = createNativeStackNavigator();

export default function TasksStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TasksList" component={TasksListScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="TaskForm" component={TaskFormScreen} />
    </Stack.Navigator>
  );
}
