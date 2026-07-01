import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import Logo from "../components/Logo";

export default function DrawerContent(props) {
  const { user, logout } = useAuth();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
      <View style={styles.profile}>
        <Logo size={40} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.role}>{user?.role}</Text>
      </View>
      <DrawerItemList {...props} />
      <View style={styles.divider} />
      <DrawerItem
        label="Déconnexion"
        labelStyle={styles.logoutLabel}
        onPress={logout}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 0 },
  profile: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
    gap: 8,
  },
  name: { fontSize: 16, fontFamily: "Manrope_700Bold", color: colors.textDark },
  role: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: colors.textMuted,
    textTransform: "capitalize",
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  logoutLabel: { color: colors.error, fontFamily: "Manrope_700Bold" },
});
