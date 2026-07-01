import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProjectsListScreen from "../screens/projects/ProjectsListScreen";
import ProjectDetailScreen from "../screens/projects/ProjectDetailScreen";
import ProjectFormScreen from "../screens/projects/ProjectFormScreen";

const Stack = createNativeStackNavigator();

export default function ProjectsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="ProjectForm" component={ProjectFormScreen} />
    </Stack.Navigator>
  );
}
