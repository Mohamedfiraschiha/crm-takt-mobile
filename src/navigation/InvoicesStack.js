import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InvoicesListScreen from "../screens/invoices/InvoicesListScreen";
import InvoiceDetailScreen from "../screens/invoices/InvoiceDetailScreen";
import InvoiceFormScreen from "../screens/invoices/InvoiceFormScreen";

const Stack = createNativeStackNavigator();

export default function InvoicesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InvoicesList" component={InvoicesListScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
      <Stack.Screen name="InvoiceForm" component={InvoiceFormScreen} />
    </Stack.Navigator>
  );
}
