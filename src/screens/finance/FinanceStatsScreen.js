import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getFinanceStats } from "../../api/finance";
import { getErrorMessage } from "../../api/errors";
import { colors, radii } from "../../theme/colors";
import ScreenHeader from "../../components/ScreenHeader";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function KpiCard({ label, value, accent }) {
  return (
    <View style={[styles.card, accent && { borderLeftColor: accent }]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

export default function FinanceStatsScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setStats(await getFinanceStats());
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
        <ScreenHeader title="Vue d'ensemble" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Vue d'ensemble" onBackPress={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!!stats && (
          <View style={styles.cardRow}>
            <KpiCard label="Trésorerie globale" value={formatCurrency(stats.tresorerieGlobale)} />
            <KpiCard label="Flux net" value={formatCurrency(stats.fluxNet)} />
            <KpiCard label="Solde caisse" value={formatCurrency(stats.soldeCaisse)} accent={colors.indigo} />
            <KpiCard label="Soldes comptes" value={formatCurrency(stats.soldesComptes)} accent={colors.primary} />
            <KpiCard label="Total encaissé" value={formatCurrency(stats.totalEncaissements)} accent={colors.green} />
            <KpiCard label="Total décaissé" value={formatCurrency(stats.totalDecaissements)} accent={colors.error} />
            <KpiCard
              label="Reste à payer fournisseurs"
              value={formatCurrency(stats.supplierRemainingTotal)}
              accent={colors.yellow}
            />
            <KpiCard label="Commandes en cours" value={stats.supplierOrdersCount} />
            <KpiCard label="Échéances proches" value={stats.supplierOrdersDueSoon} accent={colors.yellow} />
            <KpiCard label="Échéances dépassées" value={stats.supplierOrdersOverdue} accent={colors.error} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 40 },
  cardRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    minWidth: "46%",
    flexGrow: 1,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardLabel: { fontSize: 12, fontFamily: "Manrope_400Regular", color: colors.textMuted, marginBottom: 6 },
  cardValue: { fontSize: 18, fontFamily: "BarlowCondensed_700Bold", color: colors.textDark },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
});
