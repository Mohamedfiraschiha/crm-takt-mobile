import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getEmployees } from "../../api/hr";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const STATUS_STYLES = {
  actif: { label: "Actif", color: colors.green },
  inactif: { label: "Inactif", color: colors.textMuted },
  conge: { label: "En congé", color: colors.indigo },
};

function EmployeeRow({ employee }) {
  const status = STATUS_STYLES[employee.status] || {
    label: employee.status,
    color: colors.textMuted,
  };
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>
          {employee.firstName} {employee.lastName}
        </Text>
        <View style={[styles.badge, { backgroundColor: status.color }]}>
          <Text style={styles.badgeText}>{status.label}</Text>
        </View>
      </View>
      <Text style={styles.position}>{employee.position} · {employee.department}</Text>
      <Text style={styles.email}>{employee.email}</Text>
    </View>
  );
}

export default function EmployeesScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setEmployees(await getEmployees());
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
        <ScreenHeader title="Employés" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Employés" onBackPress={() => navigation.goBack()} />
      <FlatList
        contentContainerStyle={styles.content}
        data={employees}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={!!error && <Text style={styles.error}>{error}</Text>}
        renderItem={({ item }) => <EmployeeRow employee={item} />}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun employé enregistré.</Text>
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
    marginBottom: 6,
  },
  name: { fontSize: 15, fontFamily: "Manrope_700Bold", color: colors.textDark, flexShrink: 1, marginRight: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Manrope_700Bold" },
  position: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: colors.textDark },
  email: { fontSize: 12, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginTop: 2 },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
