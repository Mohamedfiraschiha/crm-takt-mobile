import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DrawerActions } from "@react-navigation/native";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const ITEMS = [
  { key: "FinanceStats", title: "Vue d'ensemble", subtitle: "Trésorerie, flux net, alertes fournisseurs" },
  { key: "BankAccounts", title: "Comptes bancaires", subtitle: "Gérer les comptes et leurs soldes" },
  { key: "Suppliers", title: "Fournisseurs", subtitle: "Liste des fournisseurs" },
  { key: "SupplierOrders", title: "Commandes fournisseurs", subtitle: "Suivi des commandes et paiements" },
  { key: "Encaissements", title: "Encaissements", subtitle: "Paiements reçus des clients" },
  { key: "Decaissements", title: "Décaissements", subtitle: "Dépenses, avec validation" },
  { key: "Tresorerie", title: "Trésorerie / Caisse", subtitle: "Entrées, sorties, ajustements" },
];

export default function FinanceHomeScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Finances"
        onMenuPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {ITEMS.map((item) => (
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
  subtitle: { fontSize: 13, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 4, maxWidth: 280 },
  chevron: { fontSize: 24, color: colors.textMuted },
});
