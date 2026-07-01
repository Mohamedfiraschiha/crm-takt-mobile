import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import dayjs from "dayjs";
import { getAttendanceHistory } from "../../api/hr";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const STATUS_STYLES = {
  present: { label: "Présent", color: colors.green },
  retard: { label: "En retard", color: colors.yellow },
  absent: { label: "Absent", color: colors.error },
  conge: { label: "Congé", color: colors.indigo },
};

function AttendanceRow({ record }) {
  const status = STATUS_STYLES[record.status] || { label: record.status, color: colors.textMuted };
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{dayjs(record.date).format("dddd D MMMM YYYY")}</Text>
        <View style={[styles.badge, { backgroundColor: status.color }]}>
          <Text style={styles.badgeText}>{status.label}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Arrivée</Text>
        <Text style={styles.value}>
          {record.checkIn ? dayjs(record.checkIn).format("HH:mm") : "—"}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Départ</Text>
        <Text style={styles.value}>
          {record.checkOut ? dayjs(record.checkOut).format("HH:mm") : "—"}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Total</Text>
        <Text style={styles.value}>{record.totalHours ?? 0} h</Text>
      </View>
    </View>
  );
}

export default function AttendanceHistoryScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setRecords(await getAttendanceHistory());
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Historique de présence" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Historique de présence" onBackPress={() => navigation.goBack()} />
      <FlatList
        contentContainerStyle={styles.content}
        data={records}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={!!error && <Text style={styles.error}>{error}</Text>}
        renderItem={({ item }) => <AttendanceRow record={item} />}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun pointage enregistré pour le moment.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: colors.textDark,
    textTransform: "capitalize",
    flexShrink: 1,
    marginRight: 8,
  },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Manrope_700Bold" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  label: { color: colors.textMuted, fontSize: 13, fontFamily: "Manrope_400Regular" },
  value: { color: colors.textDark, fontSize: 13, fontFamily: "Manrope_600SemiBold" },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
