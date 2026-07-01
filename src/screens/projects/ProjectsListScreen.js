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
import { getProjects } from "../../api/projects";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const STATUSES = [
  { key: "", label: "Tous" },
  { key: "Planifie", label: "Planifié" },
  { key: "En cours", label: "En cours" },
  { key: "En pause", label: "En pause" },
  { key: "Termine", label: "Terminé" },
  { key: "Annule", label: "Annulé" },
];

const STATUS_COLORS = {
  Planifie: colors.textMuted,
  "En cours": colors.primary,
  "En pause": colors.yellow,
  Termine: colors.green,
  Annule: colors.error,
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function ProjectCard({ project, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{project.name}</Text>
        <View
          style={[styles.badge, { backgroundColor: STATUS_COLORS[project.status] || colors.textMuted }]}
        >
          <Text style={styles.badgeText}>{project.status}</Text>
        </View>
      </View>
      <Text style={styles.code}>{project.code}</Text>
      <Text style={styles.client}>{project.client?.entreprise}</Text>
      {!!project.budget && <Text style={styles.budget}>{formatCurrency(project.budget)}</Text>}
      {!!project.endDate && (
        <Text style={styles.dates}>Échéance : {dayjs(project.endDate).format("D MMM YYYY")}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function ProjectsListScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (params) => {
    setError("");
    try {
      const result = await getProjects(params);
      setProjects(result.projects);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load({ status: statusFilter || undefined, search: search || undefined });
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearchSubmit = async () => {
    setIsLoading(true);
    await load({ status: statusFilter || undefined, search: search || undefined });
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load({ status: statusFilter || undefined, search: search || undefined });
    setIsRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Projets"
        onMenuPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        actions={[{ icon: "＋", onPress: () => navigation.navigate("ProjectForm", {}) }]}
      />
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un projet..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
      </View>
      <View style={styles.chipsRow}>
        {STATUSES.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.chip, statusFilter === item.key && styles.chipActive]}
            onPress={() => setStatusFilter(item.key)}
          >
            <Text style={[styles.chipText, statusFilter === item.key && styles.chipTextActive]}>
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
          data={projects}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={!!error && <Text style={styles.error}>{error}</Text>}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={() => navigation.navigate("ProjectDetail", { id: item._id })}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun projet trouvé.</Text>}
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
  code: { fontSize: 12, fontFamily: "Manrope_600SemiBold", color: colors.primary, marginTop: 6 },
  client: { fontSize: 13, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 2 },
  budget: { fontSize: 14, fontFamily: "BarlowCondensed_700Bold", color: colors.textDark, marginTop: 6 },
  dates: { fontSize: 12, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 4 },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
