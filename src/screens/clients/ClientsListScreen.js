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
import { DrawerActions } from "@react-navigation/native";
import { getClients } from "../../api/clients";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const STATUS_FILTERS = [
  { key: "", label: "Tous" },
  { key: "Actif", label: "Actifs" },
  { key: "Prospect", label: "Prospects" },
  { key: "Inactif", label: "Inactifs" },
];

const STATUS_STYLES = {
  Actif: colors.green,
  Inactif: colors.textMuted,
  Prospect: colors.yellow,
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function ClientCard({ client, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{client.entreprise}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: STATUS_STYLES[client.statut] || colors.textMuted },
          ]}
        >
          <Text style={styles.badgeText}>{client.statut}</Text>
        </View>
      </View>
      <Text style={styles.meta}>{client.localite} · {client.secteurActivite || "—"}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.ca}>{formatCurrency(client.ca)}</Text>
        <Text style={styles.score}>Score {client.score ?? 0}/100</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ClientsListScreen({ navigation }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (params) => {
    setError("");
    try {
      const result = await getClients(params);
      setClients(result.clients);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load({ statut: statusFilter || undefined, search: search || undefined });
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearchSubmit = async () => {
    setIsLoading(true);
    await load({ statut: statusFilter || undefined, search: search || undefined });
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load({ statut: statusFilter || undefined, search: search || undefined });
    setIsRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Clients"
        onMenuPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        actions={[{ icon: "＋", onPress: () => navigation.navigate("ClientForm", {}) }]}
      />
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une entreprise..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
      </View>
      <View style={styles.chipsRow}>
        {STATUS_FILTERS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.chip, statusFilter === item.key && styles.chipActive]}
            onPress={() => setStatusFilter(item.key)}
          >
            <Text
              style={[styles.chipText, statusFilter === item.key && styles.chipTextActive]}
            >
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
          data={clients}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={!!error && <Text style={styles.error}>{error}</Text>}
          renderItem={({ item }) => (
            <ClientCard
              client={item}
              onPress={() => navigation.navigate("ClientDetail", { id: item._id })}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Aucun client trouvé.</Text>
          }
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
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
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
  name: { fontSize: 15, fontFamily: "Manrope_700Bold", color: colors.textDark, flexShrink: 1, marginRight: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Manrope_700Bold" },
  meta: { fontSize: 13, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 6 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  ca: { fontSize: 14, fontFamily: "BarlowCondensed_700Bold", color: colors.textDark },
  score: { fontSize: 12, fontFamily: "Manrope_400Regular", color: colors.textMuted },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
