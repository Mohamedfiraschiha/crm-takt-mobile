import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HRHomeScreen from "../screens/hr/HRHomeScreen";
import PointageScreen from "../screens/hr/PointageScreen";
import LeavesScreen from "../screens/hr/LeavesScreen";
import NewLeaveRequestScreen from "../screens/hr/NewLeaveRequestScreen";
import AttendanceHistoryScreen from "../screens/hr/AttendanceHistoryScreen";
import EmployeesScreen from "../screens/hr/EmployeesScreen";
import LeaveApprovalsScreen from "../screens/hr/LeaveApprovalsScreen";

const Stack = createNativeStackNavigator();

export default function HRStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HRHome" component={HRHomeScreen} />
      <Stack.Screen name="Pointage" component={PointageScreen} />
      <Stack.Screen name="Leaves" component={LeavesScreen} />
      <Stack.Screen name="NewLeaveRequest" component={NewLeaveRequestScreen} />
      <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
      <Stack.Screen name="Employees" component={EmployeesScreen} />
      <Stack.Screen name="LeaveApprovals" component={LeaveApprovalsScreen} />
    </Stack.Navigator>
  );
}
