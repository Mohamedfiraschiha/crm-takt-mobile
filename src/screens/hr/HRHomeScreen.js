import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DrawerActions } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const ADMIN_ROLES = ["super_admin", "administrateur", "manager"];

const ITEMS = [
  {
    key: "Pointage",
    title: "Pointage",
    subtitle: "Pointer mon arrivée / départ avec vérification GPS",
  },
  {
    key: "Leaves",
    title: "Mes congés",
    subtitle: "Demander un congé, suivre mes demandes et mon solde",
  },
  {
    key: "AttendanceHistory",
    title: "Historique de présence",
    subtitle: "Consulter mes pointages passés",
  },
];

const ADMIN_ITEMS = [
  {
    key: "Employees",
    title: "Employés",
    subtitle: "Liste des employés de l'agence",
  },
  {
    key: "LeaveApprovals",
    title: "Validation des congés",
    subtitle: "Approuver ou refuser les demandes de congé de l'équipe",
  },
];

export default function HRHomeScreen({ navigation }) {
  const { user } = useAuth();
  const items = ADMIN_ROLES.includes(user?.role) ? [...ITEMS, ...ADMIN_ITEMS] : ITEMS;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Ressources humaines"
        onMenuPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.card}
            onPress={() => navigation.navigate(item.key)}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 16, fontFamily: "Manrope_700Bold", color: colors.textDark },
  subtitle: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: colors.textMuted,
    marginTop: 4,
    maxWidth: 280,
  },
  chevron: { fontSize: 24, color: colors.textMuted },
});
