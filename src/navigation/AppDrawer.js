import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import DrawerContent from "./DrawerContent";
import DashboardScreen from "../screens/DashboardScreen";
import HRStack from "./HRStack";
import ClientsStack from "./ClientsStack";
import ProspectsStack from "./ProspectsStack";
import TasksStack from "./TasksStack";
import ProjectsStack from "./ProjectsStack";
import InvoicesStack from "./InvoicesStack";
import FinanceStack from "./FinanceStack";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";

const Drawer = createDrawerNavigator();

const PROJECT_MANAGER_ROLES = ["super_admin", "administrateur", "manager"];

export default function AppDrawer() {
  const { user } = useAuth();
  const canManageProjects = PROJECT_MANAGER_ROLES.includes(user?.role);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: colors.pink,
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: colors.textDark,
        drawerLabelStyle: { fontFamily: "Manrope_600SemiBold", fontSize: 14 },
        drawerItemStyle: { borderRadius: 10, marginHorizontal: 10 },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Dashboard" }} />
      <Drawer.Screen name="Clients" component={ClientsStack} options={{ title: "Clients" }} />
      <Drawer.Screen name="Prospects" component={ProspectsStack} options={{ title: "Prospects" }} />
      <Drawer.Screen name="Tasks" component={TasksStack} options={{ title: "Tâches" }} />
      {canManageProjects && (
        <Drawer.Screen name="Projects" component={ProjectsStack} options={{ title: "Projets" }} />
      )}
      <Drawer.Screen name="Invoices" component={InvoicesStack} options={{ title: "Devis & Factures" }} />
      <Drawer.Screen name="Finance" component={FinanceStack} options={{ title: "Finances" }} />
      <Drawer.Screen name="HR" component={HRStack} options={{ title: "Ressources humaines" }} />
    </Drawer.Navigator>
  );
}
