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
import { getTaskStatuses, getTasks } from "../../api/tasks";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const PRIORITY_COLORS = {
  Urgente: colors.error,
  Haute: colors.yellow,
  Moyenne: colors.primary,
  Basse: colors.textMuted,
};

const STATUS_COLOR_MAP = {
  default: colors.textMuted,
  processing: colors.primary,
  success: colors.green,
  warning: colors.yellow,
  error: colors.error,
};

function TaskCard({ task, onPress }) {
  const isOverdue =
    task.dueDate && task.status !== "Terminée" && dayjs(task.dueDate).isBefore(dayjs(), "day");
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{task.title}</Text>
        <View style={[styles.badge, { backgroundColor: PRIORITY_COLORS[task.priority] || colors.textMuted }]}>
          <Text style={styles.badgeText}>{task.priority}</Text>
        </View>
      </View>
      <Text style={styles.status}>{task.status}</Text>
      {!!task.project?.name && <Text style={styles.project}>Projet : {task.project.name}</Text>}
      {!!task.dueDate && (
        <Text style={[styles.due, isOverdue && { color: colors.error }]}>
          Échéance : {dayjs(task.dueDate).format("D MMM YYYY")}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function TasksListScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (params) => {
    setError("");
    try {
      const [tasksResult, statusesResult] = await Promise.all([
        getTasks(params),
        getTaskStatuses(),
      ]);
      setTasks(tasksResult.tasks);
      setStatuses(statusesResult);
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
        title="Tâches"
        onMenuPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        actions={[{ icon: "＋", onPress: () => navigation.navigate("TaskForm", {}) }]}
      />
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une tâche..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
      </View>
      <View style={styles.chipsRow}>
        {[{ _id: "", name: "Tous", color: "default" }, ...statuses].map((item) => (
          <TouchableOpacity
            key={item._id || "all"}
            style={[styles.chip, statusFilter === item.name && styles.chipActive]}
            onPress={() => setStatusFilter(item.name === "Tous" ? "" : item.name)}
          >
            <Text style={[styles.chipText, statusFilter === item.name && styles.chipTextActive]}>
              {item.name}
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
          data={tasks}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={!!error && <Text style={styles.error}>{error}</Text>}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => navigation.navigate("TaskDetail", { id: item._id })}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucune tâche trouvée.</Text>}
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
  status: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: colors.primary, marginTop: 6 },
  project: { fontSize: 12, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 4 },
  due: { fontSize: 12, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 4 },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
