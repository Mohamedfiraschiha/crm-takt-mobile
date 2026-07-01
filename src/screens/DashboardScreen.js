import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DrawerActions } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import {
  getClientStats,
  getFinanceStats,
  getHRStats,
  getInvoiceStats,
  getPipelineStats,
  getTaskStats,
} from "../api/dashboard";
import { colors, radii } from "../theme/colors";
import ScreenHeader from "../components/ScreenHeader";

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

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.cardRow}>{children}</View>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setError("");
    try {
      const [clients, pipeline, tasks, invoices, finance, hr] =
        await Promise.all([
          getClientStats(),
          getPipelineStats(),
          getTaskStats(),
          getInvoiceStats(),
          getFinanceStats(),
          getHRStats(),
        ]);
      setStats({ clients, pipeline, tasks, invoices, finance, hr });
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de charger le dashboard",
      );
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadStats();
      setIsLoading(false);
    })();
  }, [loadStats]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStats();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader
          title="Dashboard"
          onMenuPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Dashboard"
        onMenuPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
      <Text style={styles.greeting}>Bonjour {user?.name}</Text>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {stats?.clients && (
        <Section title="Clients">
          <KpiCard label="Total" value={stats.clients.totalClients} />
          <KpiCard label="Actifs" value={stats.clients.actifClients} accent={colors.green} />
          <KpiCard label="Prospects" value={stats.clients.prospectClients} accent={colors.yellow} />
          <KpiCard label="CA total" value={formatCurrency(stats.clients.totalCA)} />
        </Section>
      )}

      {stats?.pipeline && (
        <Section title="Pipeline commercial">
          <KpiCard label="Deals en cours" value={stats.pipeline.overall.totalDeals} />
          <KpiCard
            label="Valeur pipeline"
            value={formatCurrency(stats.pipeline.overall.totalValue)}
          />
          <KpiCard
            label="Probabilité moy."
            value={`${stats.pipeline.overall.avgProbability}%`}
          />
        </Section>
      )}

      {stats?.tasks && (
        <Section title="Tâches">
          <KpiCard label="En retard" value={stats.tasks.overdue} accent={colors.error} />
          <KpiCard label="Aujourd'hui" value={stats.tasks.dueToday} accent={colors.yellow} />
        </Section>
      )}

      {stats?.invoices && (
        <Section title="Devis & Factures">
          <KpiCard
            label="CA encaissé"
            value={formatCurrency(stats.invoices.totalRevenue)}
            accent={colors.green}
          />
          <KpiCard
            label="En attente"
            value={formatCurrency(stats.invoices.pendingRevenue)}
            accent={colors.yellow}
          />
          <KpiCard label="En retard" value={stats.invoices.overdueCount} accent={colors.error} />
        </Section>
      )}

      {stats?.finance && (
        <Section title="Finances">
          <KpiCard
            label="Trésorerie globale"
            value={formatCurrency(stats.finance.tresorerieGlobale)}
          />
          <KpiCard label="Flux net" value={formatCurrency(stats.finance.fluxNet)} />
        </Section>
      )}

      {stats?.hr && (
        <Section title="RH">
          <KpiCard label="Employés actifs" value={stats.hr.employees?.active ?? 0} />
          <KpiCard
            label="Congés en attente"
            value={stats.hr.leaves?.pending ?? 0}
            accent={colors.yellow}
          />
        </Section>
      )}

      {!stats?.clients &&
        !stats?.pipeline &&
        !stats?.tasks &&
        !stats?.invoices &&
        !stats?.finance &&
        !stats?.hr && (
          <Text style={styles.empty}>
            Aucune donnée disponible pour votre rôle.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16, paddingBottom: 40 },
  greeting: {
    fontSize: 22,
    fontFamily: "BarlowCondensed_700Bold",
    color: colors.textDark,
    marginBottom: 20,
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: colors.textDark,
    marginBottom: 10,
  },
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
    shadowColor: colors.textDark,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: colors.textMuted,
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 20,
    fontFamily: "BarlowCondensed_700Bold",
    color: colors.textDark,
  },
  error: { color: colors.error, fontFamily: "Manrope_600SemiBold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "Manrope_400Regular", marginTop: 40 },
});
