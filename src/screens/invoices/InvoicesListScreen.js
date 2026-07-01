import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import dayjs from "dayjs";
import { DrawerActions } from "@react-navigation/native";
import { getInvoices } from "../../api/invoices";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const TYPES = [
  { key: "", label: "Tous" },
  { key: "Devis", label: "Devis" },
  { key: "Facture", label: "Factures" },
];

const STATUS_COLORS = {
  Brouillon: colors.textMuted,
  Envoyée: colors.primary,
  Accepté: colors.green,
  Refusé: colors.error,
  "Partiellement payée": colors.yellow,
  Payée: colors.green,
  "En retard": colors.error,
  Annulée: colors.textMuted,
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function InvoiceCard({ invoice, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.number}>{invoice.number}</Text>
        <View
          style={[styles.badge, { backgroundColor: STATUS_COLORS[invoice.status] || colors.textMuted }]}
        >
          <Text style={styles.badgeText}>{invoice.status}</Text>
        </View>
      </View>
      <Text style={styles.client}>{invoice.client?.entreprise}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.total}>{formatCurrency(invoice.total)}</Text>
        <Text style={styles.date}>{dayjs(invoice.date).format("D MMM YYYY")}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function InvoicesListScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (params) => {
    setError("");
    try {
      const result = await getInvoices(params);
      setInvoices(result.invoices);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load({ type: typeFilter || undefined, search: search || undefined });
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const handleSearchSubmit = async () => {
    setIsLoading(true);
    await load({ type: typeFilter || undefined, search: search || undefined });
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load({ type: typeFilter || undefined, search: search || undefined });
    setIsRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Devis & Factures"
        onMenuPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        actions={[{ icon: "＋", onPress: () => navigation.navigate("InvoiceForm", {}) }]}
      />
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par numéro..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
      </View>
      <View style={styles.chipsRow}>
        {TYPES.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.chip, typeFilter === item.key && styles.chipActive]}
            onPress={() => setTypeFilter(item.key)}
          >
            <Text style={[styles.chipText, typeFilter === item.key && styles.chipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.content}
          data={invoices}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={!!error && <Text style={styles.error}>{error}</Text>}
          renderItem={({ item }) => (
            <InvoiceCard
              invoice={item}
              onPress={() => navigation.navigate("InvoiceDetail", { id: item._id })}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun document trouvé.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 40 },
  searchRow: { paddingHorizontal: 16, paddingTop: 12 },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: "Manrope_400Regular",
    color: colors.textDark,
    backgroundColor: colors.card,
  },
  chipsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: "Manrope_600SemiBold", color: colors.textDark, fontSize: 13 },
  chipTextActive: { color: "#fff" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  number: { fontSize: 15, fontFamily: "Manrope_700Bold", color: colors.textDark },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Manrope_700Bold" },
  client: { fontSize: 13, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 6 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  total: { fontSize: 14, fontFamily: "BarlowCondensed_700Bold", color: colors.textDark },
  date: { fontSize: 12, fontFamily: "Manrope_400Regular", color: colors.textMuted },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
