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
import { getDeals } from "../../api/deals";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const STAGES = [
  { key: "", label: "Tous" },
  { key: "Prospect", label: "Prospect" },
  { key: "Qualification", label: "Qualification" },
  { key: "Proposition", label: "Proposition" },
  { key: "Négociation", label: "Négociation" },
  { key: "Gagné", label: "Gagné" },
  { key: "Perdu", label: "Perdu" },
];

const STAGE_COLORS = {
  Prospect: colors.textMuted,
  Qualification: colors.indigo,
  Proposition: colors.primary,
  Négociation: colors.yellow,
  Gagné: colors.green,
  Perdu: colors.error,
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function DealCard({ deal, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{deal.title}</Text>
        <View
          style={[styles.badge, { backgroundColor: STAGE_COLORS[deal.stage] || colors.textMuted }]}
        >
          <Text style={styles.badgeText}>{deal.stage}</Text>
        </View>
      </View>
      <Text style={styles.company}>{deal.company}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.amount}>{formatCurrency(deal.amount)}</Text>
        <Text style={styles.probability}>{deal.probability}% probabilité</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ProspectsListScreen({ navigation }) {
  const [deals, setDeals] = useState([]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (params) => {
    setError("");
    try {
      const result = await getDeals(params);
      setDeals(result.deals);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load({ stage: stageFilter || undefined, search: search || undefined });
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageFilter]);

  const handleSearchSubmit = async () => {
    setIsLoading(true);
    await load({ stage: stageFilter || undefined, search: search || undefined });
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load({ stage: stageFilter || undefined, search: search || undefined });
    setIsRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Prospects"
        onMenuPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        actions={[
          { label: "Kanban", onPress: () => navigation.navigate("ProspectsKanban") },
          { icon: "＋", onPress: () => navigation.navigate("ProspectForm", {}) },
        ]}
      />
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un deal..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
      </View>
      <View style={styles.chipsRow}>
        {STAGES.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.chip, stageFilter === item.key && styles.chipActive]}
            onPress={() => setStageFilter(item.key)}
          >
            <Text style={[styles.chipText, stageFilter === item.key && styles.chipTextActive]}>
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
          data={deals}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={!!error && <Text style={styles.error}>{error}</Text>}
          renderItem={({ item }) => (
            <DealCard
              deal={item}
              onPress={() => navigation.navigate("ProspectDetail", { id: item._id })}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun deal trouvé.</Text>}
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
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingTop: 12 },
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
  title: { fontSize: 15, fontFamily: "Manrope_700Bold", color: colors.textDark, flexShrink: 1, marginRight: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Manrope_700Bold" },
  company: { fontSize: 13, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 6 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  amount: { fontSize: 14, fontFamily: "BarlowCondensed_700Bold", color: colors.textDark },
  probability: { fontSize: 12, fontFamily: "Manrope_400Regular", color: colors.textMuted },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
