import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FinanceHomeScreen from "../screens/finance/FinanceHomeScreen";
import FinanceStatsScreen from "../screens/finance/FinanceStatsScreen";
import BankAccountsScreen from "../screens/finance/BankAccountsScreen";
import BankAccountFormScreen from "../screens/finance/BankAccountFormScreen";
import SuppliersScreen from "../screens/finance/SuppliersScreen";
import SupplierFormScreen from "../screens/finance/SupplierFormScreen";
import SupplierOrdersScreen from "../screens/finance/SupplierOrdersScreen";
import SupplierOrderFormScreen from "../screens/finance/SupplierOrderFormScreen";
import EncaissementsScreen from "../screens/finance/EncaissementsScreen";
import EncaissementFormScreen from "../screens/finance/EncaissementFormScreen";
import DecaissementsScreen from "../screens/finance/DecaissementsScreen";
import DecaissementFormScreen from "../screens/finance/DecaissementFormScreen";
import TresorerieScreen from "../screens/finance/TresorerieScreen";
import TresorerieFormScreen from "../screens/finance/TresorerieFormScreen";

const Stack = createNativeStackNavigator();

export default function FinanceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FinanceHome" component={FinanceHomeScreen} />
      <Stack.Screen name="FinanceStats" component={FinanceStatsScreen} />
      <Stack.Screen name="BankAccounts" component={BankAccountsScreen} />
      <Stack.Screen name="BankAccountForm" component={BankAccountFormScreen} />
      <Stack.Screen name="Suppliers" component={SuppliersScreen} />
      <Stack.Screen name="SupplierForm" component={SupplierFormScreen} />
      <Stack.Screen name="SupplierOrders" component={SupplierOrdersScreen} />
      <Stack.Screen name="SupplierOrderForm" component={SupplierOrderFormScreen} />
      <Stack.Screen name="Encaissements" component={EncaissementsScreen} />
      <Stack.Screen name="EncaissementForm" component={EncaissementFormScreen} />
      <Stack.Screen name="Decaissements" component={DecaissementsScreen} />
      <Stack.Screen name="DecaissementForm" component={DecaissementFormScreen} />
      <Stack.Screen name="Tresorerie" component={TresorerieScreen} />
      <Stack.Screen name="TresorerieForm" component={TresorerieFormScreen} />
    </Stack.Navigator>
  );
}
