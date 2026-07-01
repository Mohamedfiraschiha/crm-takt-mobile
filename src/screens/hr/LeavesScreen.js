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
import { getLeaveBalances, getMyLeaves } from "../../api/hr";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import GradientButton from "../../components/GradientButton";
import ScreenHeader from "../../components/ScreenHeader";

const TYPE_LABELS = {
  annuel: "Congé annuel",
  maladie: "Maladie",
  sans_solde: "Sans solde",
  maternite: "Maternité",
  autre: "Autre",
};

const STATUS_STYLES = {
  en_attente: { label: "En attente", color: colors.yellow },
  approuve: { label: "Approuvé", color: colors.green },
  refuse: { label: "Refusé", color: colors.error },
};

function LeaveCard({ leave }) {
  const status = STATUS_STYLES[leave.status] || { label: leave.status, color: colors.textMuted };
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{TYPE_LABELS[leave.type] || leave.type}</Text>
        <View style={[styles.badge, { backgroundColor: status.color }]}>
          <Text style={styles.badgeText}>{status.label}</Text>
        </View>
      </View>
      <Text style={styles.cardDates}>
        {dayjs(leave.startDate).format("D MMM YYYY")} → {dayjs(leave.endDate).format("D MMM YYYY")}
      </Text>
      <Text style={styles.cardReason}>{leave.reason}</Text>
      {!!leave.decisionComment && (
        <Text style={styles.cardComment}>Commentaire : {leave.decisionComment}</Text>
      )}
    </View>
  );
}

export default function LeavesScreen({ navigation }) {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [leavesResult, balancesResult] = await Promise.all([
        getMyLeaves(),
        getLeaveBalances(),
      ]);
      setLeaves(leavesResult);
      setBalance(balancesResult?.[0] || null);
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
        <ScreenHeader title="Mes congés" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Mes congés" onBackPress={() => navigation.goBack()} />
      <FlatList
      contentContainerStyle={styles.content}
      data={leaves}
      keyExtractor={(item) => item._id}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
      ListHeaderComponent={
        <View>
          {!!balance && (
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Solde congé annuel {balance.year}</Text>
              <Text style={styles.balanceValue}>
                {balance.remainingDays} / {balance.annualAllowance} jours restants
              </Text>
            </View>
          )}
          {!!error && <Text style={styles.error}>{error}</Text>}
          <GradientButton
            title="Nouvelle demande de congé"
            onPress={() => navigation.navigate("NewLeaveRequest")}
            style={styles.newButton}
          />
        </View>
      }
      renderItem={({ item }) => <LeaveCard leave={item} />}
      ListEmptyComponent={
        <Text style={styles.empty}>Aucune demande de congé pour le moment.</Text>
      }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 40 },
  balanceCard: {
    backgroundColor: colors.textDark,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 16,
  },
  balanceLabel: { color: "#cfe9f2", fontFamily: "Manrope_400Regular", fontSize: 13 },
  balanceValue: {
    color: "#fff",
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 22,
    marginTop: 4,
  },
  newButton: { marginBottom: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 15, fontFamily: "Manrope_700Bold", color: colors.textDark },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Manrope_700Bold" },
  cardDates: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: colors.textDark,
    marginTop: 8,
  },
  cardReason: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: colors.textMuted,
    marginTop: 4,
  },
  cardComment: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: "italic",
  },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
